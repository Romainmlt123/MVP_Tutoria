"""
TutorIA Backend - API FastAPI (chat texte + session Realtime).
"""

import os
import json
import httpx
import uuid
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from openai import OpenAI
from dotenv import load_dotenv

from .config import SYSTEM_PROMPT, REALTIME_INSTRUCTIONS, GRAPH_TOOL_SCHEMA

load_dotenv()

app = FastAPI(
    title="TutorIA API",
    version="1.0",
    description="API pour le chat texte, le mode vocal Realtime et les graphiques JSXGraph.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_openai_client():
    """Retourne un client OpenAI configuré."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY non configurée")
    return OpenAI(api_key=api_key), api_key


def extract_graph(content: str) -> dict | None:
    """Extrait le JSON du graphique depuis un bloc ```jsxgraph ... ```."""
    if "```jsxgraph" not in content:
        return None
    try:
        start = content.find("```jsxgraph") + 11
        end = content.find("```", start)
        if end <= start:
            return None
        return json.loads(content[start:end].strip())
    except (json.JSONDecodeError, ValueError):
        return None


@app.get("/health")
async def health():
    """Health check pour le déploiement."""
    return {"status": "ok", "service": "TutorIA"}


@app.post("/api/chat")
async def chat(request: dict):
    """
    Chat texte avec GPT-4o.
    Body: { "messages": [ { "role": "user"|"assistant", "content": "..." }, ... ] }
    Réponse: { "content": "...", "graph": {...} | null }
    """
    client, _ = get_openai_client()

    messages = request.get("messages", [])
    if not messages:
        raise HTTPException(status_code=400, detail="Messages requis")

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "system", "content": SYSTEM_PROMPT}] + messages,
        temperature=0.7,
        max_tokens=2000,
    )

    content = response.choices[0].message.content
    return {"content": content, "graph": extract_graph(content)}


@app.post("/api/realtime/session")
async def create_realtime_session():
    """
    Crée une session OpenAI Realtime (token éphémère pour WebRTC).
    Le client utilisera cette clé pour appeler directement api.openai.com/v1/realtime/calls avec le SDP.
    Réponse: { "success": true, "client_secret": { "value": "...", "expires_at": ... } }
    """
    _, api_key = get_openai_client()

    session_config = {
        "session": {
            "type": "realtime",
            "model": "gpt-realtime",
            "instructions": REALTIME_INSTRUCTIONS,
            "tools": [GRAPH_TOOL_SCHEMA],
            "audio": {
                "input": {
                    "turn_detection": {
                        "type": "server_vad",
                        "threshold": 0.4,
                        "prefix_padding_ms": 400,
                        "silence_duration_ms": 600,
                        "create_response": True,
                        "interrupt_response": True,
                    }
                },
                "output": {"voice": "marin"},
            },
        }
    }

    async with httpx.AsyncClient() as http_client:
        response = await http_client.post(
            "https://api.openai.com/v1/realtime/client_secrets",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=session_config,
            timeout=30.0,
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.text or "Erreur API OpenAI Realtime",
        )

    data = response.json()
    return {
        "success": True,
        "client_secret": {
            "value": data.get("value"),
            "expires_at": data.get("expires_at"),
        },
    }


@app.post("/api/realtime/connect", response_class=PlainTextResponse)
async def realtime_connect(request: Request):
    """
    Interface unifiée : reçoit le SDP offer du client, envoie SDP + session à OpenAI,
    retourne le SDP answer. La session inclut explicitement turn_detection (VAD).
    """
    _, api_key = get_openai_client()
    sdp = (await request.body()).decode("utf-8")

    session_config = {
        "type": "realtime",
        "model": "gpt-realtime",
        "instructions": REALTIME_INSTRUCTIONS,
        "tools": [GRAPH_TOOL_SCHEMA],
        "audio": {
            "input": {
                "turn_detection": {
                    "type": "server_vad",
                    "threshold": 0.4,
                    "prefix_padding_ms": 400,
                    "silence_duration_ms": 600,
                    "create_response": True,
                    "interrupt_response": True,
                }
            },
            "output": {"voice": "marin"},
        },
    }

    boundary = uuid.uuid4().hex
    parts = []
    parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="sdp"\r\nContent-Type: application/sdp\r\n\r\n'.encode())
    parts.append(sdp.encode("utf-8"))
    parts.append(f'\r\n--{boundary}\r\nContent-Disposition: form-data; name="session"\r\n\r\n'.encode())
    parts.append(json.dumps(session_config).encode("utf-8"))
    parts.append(f'\r\n--{boundary}--\r\n'.encode())
    body = b"".join(parts)

    async with httpx.AsyncClient() as http_client:
        try:
            response = await http_client.post(
                "https://api.openai.com/v1/realtime/calls",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": f"multipart/form-data; boundary={boundary}",
                },
                content=body,
                timeout=90.0,
            )
        except httpx.TimeoutException:
            print("[realtime/connect] Timeout vers OpenAI (90s)")
            raise HTTPException(
                status_code=504,
                detail="Le service vocal met trop de temps à répondre. Réessaie dans un moment.",
            )

    if response.status_code != 200:
        err_body = response.text or "Erreur API OpenAI Realtime"
        print(f"[realtime/connect] OpenAI a répondu {response.status_code}: {err_body[:500]}")
        if response.status_code in (502, 503, 504):
            err_body = (
                "Le service vocal OpenAI est temporairement indisponible ou met trop de temps à répondre. "
                "Réessaie dans une minute ou deux."
            )
        raise HTTPException(
            status_code=response.status_code,
            detail=err_body,
        )

    body = response.text
    # Si l'API renvoie du JSON (ex. {"detail": "v=0\r\n..."}), extraire le SDP
    if body.strip().startswith("{"):
        try:
            data = json.loads(body)
            body = data.get("detail") or data.get("sdp") or data.get("answer") or body
            if isinstance(body, dict):
                body = body.get("sdp") or body.get("detail") or str(body)
        except Exception:
            pass
    return PlainTextResponse(body)


@app.on_event("startup")
async def startup():
    print("🚀 TutorIA API démarrée")
