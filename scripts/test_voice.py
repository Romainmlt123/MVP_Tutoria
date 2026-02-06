#!/usr/bin/env python3
"""
Tests du mode vocal TutorIA :
- Backend : POST /api/realtime/connect avec un SDP minimal
- Vérifie que le backend répond (200 avec SDP ou 4xx si OpenAI rejette le SDP invalide)

Prérequis : backend lancé (python main.py), OPENAI_API_KEY dans .env
Usage : depuis la racine du projet : python scripts/test_voice.py
"""
import os
import sys
import urllib.request
import urllib.error

BASE_URL = os.environ.get("BASE_URL", "http://localhost:8000")

# SDP minimal type "offer" (non valide pour une vraie négociation, mais permet de tester le flux)
MINIMAL_SDP_OFFER = """v=0
o=- 0 0 IN IP4 127.0.0.1
s=-
t=0 0
m=audio 9 UDP/TLS/RTP/SAVPF 111
a=rtpmap:111 opus/48000/2
"""


def test_health():
    """Vérifie que le backend répond."""
    url = f"{BASE_URL}/health"
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = resp.read().decode()
    return "ok" in data.lower() or "status" in data.lower()


def test_realtime_connect():
    """
    POST /api/realtime/connect avec un SDP minimal.
    - 200 + corps contenant v= : backend + OpenAI OK (réponse SDP answer)
    - 4xx : OpenAI a rejeté notre SDP (normal avec un SDP minimal) → backend a bien relayé
    - 500 : erreur côté backend
    """
    url = f"{BASE_URL}/api/realtime/connect"
    req = urllib.request.Request(url, method="POST", data=MINIMAL_SDP_OFFER.encode("utf-8"))
    req.add_header("Content-Type", "application/sdp")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            code = resp.getcode()
            body = resp.read().decode("utf-8", errors="replace")
            return code, body, None
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace") if e.fp else ""
        return e.code, body, str(e.reason)
    except urllib.error.URLError as e:
        return None, None, str(e.reason)


def main():
    print("==============================================")
    print("  Tests mode vocal TutorIA")
    print(f"  Backend: {BASE_URL}")
    print("==============================================")

    # 1. Health
    print("\n[1/2] GET /health")
    try:
        if not test_health():
            print("  ÉCHEC — /health ne renvoie pas ok")
            sys.exit(1)
        print("  OK — Backend joignable")
    except Exception as e:
        print(f"  ÉCHEC — {e}")
        sys.exit(1)

    # 2. Realtime connect
    print("\n[2/2] POST /api/realtime/connect (SDP minimal)")
    code, body, err = test_realtime_connect()
    if err and code is None:
        print(f"  ÉCHEC — Connexion impossible: {err}")
        print("  Vérifiez que le backend tourne (python main.py) et que BASE_URL est correct.")
        sys.exit(1)
    if code == 200:
        if "v=" in body and ("m=" in body or "sdp" in body.lower()):
            print("  OK — Backend a renvoyé une réponse SDP (connexion OpenAI Realtime OK)")
        else:
            print("  OK — HTTP 200 (corps reçu, pas forcément un SDP valide)")
        print(f"  Corps (début): {body[:120]!r}...")
    elif code and 400 <= code < 500:
        print(f"  OK — HTTP {code} (OpenAI a rejeté le SDP minimal, comportement attendu)")
        print(f"  Le backend relaie correctement les erreurs OpenAI.")
        print(f"  Détail (début): {body[:150]!r}...")
    elif code and code >= 500:
        print(f"  ÉCHEC — HTTP {code} — Erreur serveur")
        print(f"  Détail: {body[:300]}")
        sys.exit(1)
    else:
        print(f"  ÉCHEC — HTTP {code} — {body[:200]}")
        sys.exit(1)

    print("\n==============================================")
    print("  Résumé : le backend et l’endpoint vocal sont opérationnels.")
    print("  Si le micro ne déclenche rien chez toi, vérifie :")
    print("  - Autorisation micro dans le navigateur (cadenas / paramètres du site)")
    print("  - Aucune autre app qui bloque le micro (dual boot / autre OS)")
    print("  - Tester dans une autre fenêtre privée ou un autre navigateur")
    print("==============================================")


if __name__ == "__main__":
    main()
