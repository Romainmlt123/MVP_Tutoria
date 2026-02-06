# Tutor'IA — Apprentissage Premium

Application éducative avec assistant IA : **chat texte**, **mode vocal** (OpenAI Realtime + WebRTC) et **graphiques 2D/3D** (JSXGraph).

---

## 🚀 Démarrage rapide

### Prérequis

- **Python 3.10+** (backend)
- **Node.js 18+** (frontend)
- Clé API **OpenAI** (chat + mode vocal + graphiques)

### Installation

```bash
# Cloner le repo
git clone https://github.com/Romainmlt123/MVP_Tutoria.git
cd MVP_Tutoria

# Backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r backend/requirements.txt

# Frontend
cd frontend
npm install
cd ..
```

### Configuration

À la racine du projet, créer un fichier `.env` :

```env
OPENAI_API_KEY=sk-...
PORT=8000
HOST=0.0.0.0
DEBUG=true
```

Le frontend utilise `VITE_API_URL` (par défaut `http://localhost:8000`) ; tu peux surcharger dans `frontend/.env` si besoin.

### Lancer l’application

**Terminal 1 — Backend :**

```bash
python main.py
```

- API : http://localhost:8000  
- Docs : http://localhost:8000/docs  

**Terminal 2 — Frontend :**

```bash
cd frontend && npm run dev
```

- App : http://localhost:5173  

---

## 📁 Structure du projet

```
Frontend_tutoria/
├── main.py                 # Point d'entrée backend (uvicorn)
├── .env                    # Variables d'environnement (ne pas commiter)
├── backend/
│   ├── app.py              # FastAPI : /api/chat, /api/realtime/session
│   ├── config.py           # Prompts, schéma generate_graph, instructions Realtime
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Routes (/, /chat, /voice, etc.)
│   │   ├── components/     # GraphPanel, VoiceBars, ChatMessage, etc.
│   │   ├── hooks/          # useRealtimeVoice (WebRTC + OpenAI Realtime)
│   │   ├── store/          # chatStore (messages, currentGraph, etc.)
│   │   └── utils/          # graphNormalizer (2D/3D)
│   ├── package.json
│   └── vite.config.js
├── docs/                   # Documentation
│   ├── README.md           # Index documentation
│   ├── VOICE_DIAGNOSTIC.md # Dépannage mode vocal
│   └── ...
├── Maquette_frontend/      # Maquettes (maquette_version2, etc.)
├── scripts/                # Tests (test_voice.py, test_api.py)
├── PATCHLOG.md             # Erreurs rencontrées et résolutions
└── README.md               # Ce fichier
```

---

## 🎯 Fonctionnalités

| Fonctionnalité | Description |
|----------------|-------------|
| **Chat texte** | Messages avec l’IA (GPT-4o), graphiques intégrés dans les réponses. |
| **Mode vocal** | Connexion WebRTC + OpenAI Realtime (token éphémère), VAD serveur, génération de graphiques à la voix. |
| **Graphiques 2D/3D** | Fonctions, éléments géométriques, surfaces et courbes 3D (JSXGraph). |
| **UI** | Barres animées (5 traits) quand l’IA parle ; barres au centre sans graphique, dans le footer quand un graphique est affiché. |

---

## 📚 Documentation

- **[docs/README.md](docs/README.md)** — Index de la documentation
- **[docs/VOICE_DIAGNOSTIC.md](docs/VOICE_DIAGNOSTIC.md)** — Dépannage mode vocal (micro, permissions, logs)
- **[docs/SETUP_GITHUB.md](docs/SETUP_GITHUB.md)** — Configuration du dépôt GitHub (remote, premier push)
- **[PATCHLOG.md](PATCHLOG.md)** — Historique des erreurs et correctifs

---

## 🔗 API

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | Health check |
| POST | `/api/chat` | Chat texte (body: `{ "messages": [...] }` → `{ "content", "graph"? }`) |
| POST | `/api/realtime/session` | Token éphémère pour WebRTC (→ `client_secret.value`) |

Le frontend appelle ensuite **directement** `https://api.openai.com/v1/realtime/calls` avec ce token et le SDP (pas de proxy multipart).

---

## 📄 Licence

Projet privé / éducatif.

---

**Repo GitHub :** [https://github.com/Romainmlt123/MVP_Tutoria](https://github.com/Romainmlt123/MVP_Tutoria)
