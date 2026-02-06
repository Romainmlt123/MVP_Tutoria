# TutorIA Backend

API FastAPI pour le chat texte (GPT-4o), le mode vocal (OpenAI Realtime) et les graphiques JSXGraph.

## Installation

```bash
# Depuis la racine du repo
python -m venv venv
source venv/bin/activate   # ou venv\Scripts\activate sur Windows
pip install -r backend/requirements.txt
```

## Configuration

```bash
cp .env.example .env
# Éditer .env et ajouter OPENAI_API_KEY=sk-...
```

## Lancer le serveur

```bash
# Depuis la racine du repo
python main.py
```

Ou avec uvicorn directement :

```bash
uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

- API : http://localhost:8000  
- Docs : http://localhost:8000/docs  
- Health : http://localhost:8000/health  

## Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | Health check |
| POST | `/api/chat` | Chat texte (body: `{ "messages": [...] }`, réponse: `{ "content", "graph"? }`) |
| POST | `/api/realtime/session` | Token éphémère pour WebRTC Realtime (réponse: `{ "success", "client_secret": { "value", "expires_at" } }`) |
