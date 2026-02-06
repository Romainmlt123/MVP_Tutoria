"""
TutorIA Backend - API simplifiée
"""

import os
import json
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from openai import OpenAI
from dotenv import load_dotenv

from .config import SYSTEM_PROMPT, REALTIME_INSTRUCTIONS, GRAPH_TOOL_SCHEMA

load_dotenv()

app = FastAPI(title="TutorIA API", version="2.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "dist")
if os.path.exists(DIST_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")


def get_openai_client():
    """Retourne un client OpenAI configuré"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY non configurée")
    return OpenAI(api_key=api_key), api_key


def extract_graph(content: str) -> dict | None:
    """Extrait le JSON du graphique depuis la réponse"""
    if '```jsxgraph' not in content:
        return None
    try:
        start = content.find('```jsxgraph') + 11
        end = content.find('```', start)
        return json.loads(content[start:end].strip()) if end > start else None
    except:
        return None


@app.get("/health")
async def health():
    return {"status": "ok", "service": "TutorIA"}


@app.post("/api/chat")
async def chat(request: dict):
    """Chat texte avec GPT-4o"""
    client, _ = get_openai_client()
    
    messages = request.get("messages", [])
    if not messages:
        raise HTTPException(status_code=400, detail="Messages requis")
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "system", "content": SYSTEM_PROMPT}] + messages,
        temperature=0.7,
        max_tokens=2000
    )
    
    content = response.choices[0].message.content
    return {"content": content, "graph": extract_graph(content)}


@app.post("/api/realtime/session")
async def create_realtime_session():
    """Crée une session OpenAI Realtime avec token éphémère"""
    _, api_key = get_openai_client()
    
    session_config = {
        "session": {
            "type": "realtime",
            "model": "gpt-realtime",
            "audio": {"output": {"voice": "alloy"}},
            "instructions": REALTIME_INSTRUCTIONS,
            "tools": [GRAPH_TOOL_SCHEMA]
        }
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/realtime/client_secrets",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=session_config,
            timeout=30.0
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        
        data = response.json()
        return {
            "success": True,
            "client_secret": {"value": data.get("value"), "expires_at": data.get("expires_at")}
        }


@app.get("/{path:path}")
async def serve_frontend(path: str):
    """Sert le frontend React"""
    file_path = os.path.join(DIST_DIR, path) if path else None
    if file_path and os.path.exists(file_path):
        return FileResponse(file_path)
    return FileResponse(os.path.join(DIST_DIR, "index.html"))


@app.on_event("startup")
async def startup():
    print("🚀 TutorIA démarré!")
