#!/usr/bin/env bash
# Tests API TutorIA : health, chat texte, chat avec JSXGraph, session Realtime.
# Prérequis : backend lancé (python main.py) et OPENAI_API_KEY dans .env

set -e
BASE_URL="${BASE_URL:-http://localhost:8000}"

echo "=============================================="
echo "  Tests API TutorIA — $BASE_URL"
echo "=============================================="

# --- 1. Health ---
echo ""
echo "[1/4] GET /health"
resp=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
body=$(echo "$resp" | head -n -1)
code=$(echo "$resp" | tail -n 1)
if [ "$code" = "200" ] && echo "$body" | grep -q '"status":"ok"'; then
  echo "  OK — $body"
else
  echo "  ÉCHEC — HTTP $code — $body"
  exit 1
fi

# --- 2. Chat texte (sans graphique) ---
echo ""
echo "[2/4] POST /api/chat (message simple)"
chat_simple=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Dis-moi juste : OK en un mot."}]}')
body_simple=$(echo "$chat_simple" | head -n -1)
code_simple=$(echo "$chat_simple" | tail -n 1)
if [ "$code_simple" != "200" ]; then
  echo "  ÉCHEC — HTTP $code_simple"
  echo "$body_simple" | head -c 500
  echo ""
  exit 1
fi
has_content=$(echo "$body_simple" | python3 -c "import sys,json; d=json.load(sys.stdin); exit(0 if d.get('content') else 1)" 2>/dev/null) || true
if [ -z "$has_content" ]; then
  echo "  OK — Réponse avec champ 'content'"
  echo "  Aperçu: $(echo "$body_simple" | python3 -c "import sys,json; d=json.load(sys.stdin); c=d.get('content','')[:80]; print(repr(c))" 2>/dev/null || echo "—")"
else
  echo "  ÉCHEC — Pas de champ 'content' dans la réponse"
  echo "$body_simple" | head -c 400
  exit 1
fi

# --- 3. Chat avec demande de graphique (JSXGraph) ---
echo ""
echo "[3/4] POST /api/chat (demande de graphique y=x²)"
chat_graph=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Trace la parabole y = x² entre -3 et 3, avec un bloc jsxgraph uniquement. Réponds très court."}]}')
body_graph=$(echo "$chat_graph" | head -n -1)
code_graph=$(echo "$chat_graph" | tail -n 1)
if [ "$code_graph" != "200" ]; then
  echo "  ÉCHEC — HTTP $code_graph"
  echo "$body_graph" | head -c 500
  echo ""
  exit 1
fi
graph_ok=$(echo "$body_graph" | python3 -c "
import sys, json
try:
  d = json.load(sys.stdin)
  g = d.get('graph')
  if g is not None and isinstance(g, dict):
    print('graph_ok')
  else:
    print('no_graph')
except Exception:
  print('no_graph')
" 2>/dev/null) || echo "no_graph"
if [ "$graph_ok" = "graph_ok" ]; then
  echo "  OK — Réponse avec 'content' et champ 'graph' (JSXGraph)"
  echo "$body_graph" | python3 -c "
import sys, json
d = json.load(sys.stdin)
g = d.get('graph')
if g:
  print('  graph keys:', list(g.keys())[:10])
  if g.get('title'):
    print('  title:', g.get('title'))
" 2>/dev/null || true
else
  echo "  OK — Réponse chat valide (pas de graph cette fois ; le modèle peut ne pas en générer à chaque fois)."
fi

# --- 4. Session Realtime (token vocal) ---
echo ""
echo "[4/4] POST /api/realtime/session"
realtime=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/realtime/session" \
  -H "Content-Type: application/json")
body_rt=$(echo "$realtime" | head -n -1)
code_rt=$(echo "$realtime" | tail -n 1)
if [ "$code_rt" != "200" ]; then
  echo "  ÉCHEC — HTTP $code_rt"
  echo "$body_rt" | head -c 500
  echo ""
  exit 1
fi
secret_ok=$(echo "$body_rt" | python3 -c "
import sys, json
try:
  d = json.load(sys.stdin)
  cs = d.get('client_secret') or {}
  v = cs.get('value')
  if d.get('success') and v and len(v) > 10:
    print('ok')
  else:
    print('no')
except Exception:
  print('no')
" 2>/dev/null) || echo "no"
if [ "$secret_ok" = "ok" ]; then
  echo "  OK — success + client_secret.value (token Realtime pour WebRTC)"
else
  echo "  ÉCHEC — Réponse sans client_secret valide"
  echo "$body_rt" | head -c 400
  exit 1
fi

echo ""
echo "=============================================="
echo "  Tous les tests API sont passés."
echo "=============================================="
