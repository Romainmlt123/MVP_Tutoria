#!/usr/bin/env python3
"""
Tests API TutorIA : health, chat texte, chat avec JSXGraph, session Realtime.
Prérequis : backend lancé (python main.py) et OPENAI_API_KEY dans .env
"""
import os
import sys
import json
import urllib.request
import urllib.error

BASE_URL = os.environ.get("BASE_URL", "http://localhost:8000")


def request(method, path, body=None):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    if body is not None:
        req.data = json.dumps(body).encode("utf-8")
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.getcode(), json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else ""
        try:
            data = json.loads(body) if body else {}
        except json.JSONDecodeError:
            data = {"detail": body}
        return e.code, data
    except urllib.error.URLError as e:
        print(f"  Erreur connexion: {e.reason}")
        sys.exit(1)


def main():
    print("==============================================")
    print(f"  Tests API TutorIA — {BASE_URL}")
    print("==============================================")

    # 1. Health
    print("\n[1/4] GET /health")
    code, data = request("GET", "/health")
    if code != 200 or data.get("status") != "ok":
        print(f"  ÉCHEC — HTTP {code} — {data}")
        sys.exit(1)
    print(f"  OK — {data}")

    # 2. Chat texte simple
    print("\n[2/4] POST /api/chat (message simple)")
    code, data = request(
        "POST",
        "/api/chat",
        {"messages": [{"role": "user", "content": "Réponds en un seul mot : OK."}]},
    )
    if code != 200:
        print(f"  ÉCHEC — HTTP {code} — {data}")
        sys.exit(1)
    if not data.get("content"):
        print("  ÉCHEC — Pas de champ 'content'")
        sys.exit(1)
    print(f"  OK — content présent (aperçu: {data['content'][:60]!r}...)")

    # 3. Chat avec demande de graphique (JSXGraph)
    print("\n[3/4] POST /api/chat (demande de graphique y=x²)")
    code, data = request(
        "POST",
        "/api/chat",
        {
            "messages": [
                {
                    "role": "user",
                    "content": "Trace la parabole y = x² entre -3 et 3. Réponds avec un seul bloc jsxgraph (JSON) et une phrase courte.",
                }
            ]
        },
    )
    if code != 200:
        print(f"  ÉCHEC — HTTP {code} — {data}")
        sys.exit(1)
    graph = data.get("graph")
    if graph and isinstance(graph, dict):
        print(f"  OK — Réponse avec 'content' et champ 'graph' (JSXGraph)")
        print(f"  graph keys: {list(graph.keys())[:10]}")
        if graph.get("title"):
            print(f"  title: {graph['title']}")
    else:
        print("  OK — Réponse chat valide (pas de graph cette fois).")

    # 4. Session Realtime
    print("\n[4/4] POST /api/realtime/session")
    code, data = request("POST", "/api/realtime/session")
    if code != 200:
        print(f"  ÉCHEC — HTTP {code} — {data}")
        sys.exit(1)
    secret = (data.get("client_secret") or {}).get("value")
    if not data.get("success") or not secret or len(secret) < 10:
        print("  ÉCHEC — Pas de client_secret valide")
        sys.exit(1)
    print("  OK — success + client_secret (token Realtime pour WebRTC)")

    print("\n==============================================")
    print("  Tous les tests API sont passés.")
    print("==============================================")


if __name__ == "__main__":
    main()
