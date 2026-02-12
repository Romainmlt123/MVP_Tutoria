# Tutor'IA

**Assistant pédagogique intelligent** — chat texte, mode vocal et graphiques 2D/3D pour apprendre les maths et les sciences.

---

## À propos du projet

**Tutor'IA** est une application web d’apprentissage qui combine :

- un **chat avec l’IA** (GPT-4o) pour poser des questions et obtenir des explications ;
- un **mode vocal** (OpenAI Realtime + WebRTC) pour parler naturellement et faire tracer des graphiques à la voix ;
- des **graphiques interactifs** (JSXGraph) : fonctions, figures géométriques, surfaces et courbes 3D ;
- des **flashcards** et un **tableau de bord** pour suivre sa progression ;
- une **authentification** et un stockage des conversations via **Supabase**.

L’objectif : offrir une expérience fluide (texte + voix + visuels) pour réviser et explorer les notions en mathématiques et sciences.

---

## Fonctionnalités principales

| Fonctionnalité | Description |
|----------------|-------------|
| **Chat texte** | Dialogue avec l’IA (GPT-4o). Les réponses peuvent inclure des graphiques générés automatiquement (bloc `jsxgraph`), affichés dans un panneau dédié sans afficher le JSON. |
| **Mode vocal** | Connexion WebRTC à l’API OpenAI Realtime : tu parles, l’IA répond à la voix. Détection de fin de prise de parole (VAD), possibilité de demander un graphique à l’oral (ex. « Trace la fonction cosinus »). |
| **Graphiques 2D / 3D** | Rendu avec JSXGraph : fonctions \( f(x) \), points, segments, polygones, cercles ; en 3D : surfaces \( z = f(x,y) \), courbes paramétriques, sphères. Zoom, pan et rotation 3D. |
| **Flashcards** | Parcours par matière, révision avec QCM, suivi des résultats. |
| **Analytics** | Tableau de bord (stats, graphiques de progression). |
| **Auth & données** | Inscription / connexion (Supabase Auth), profils, conversations et messages persistés en base. |

---

## Stack technique

| Couche | Technologies |
|--------|--------------|
| **Frontend** | React 19, Vite 7, React Router, Tailwind CSS 4, Zustand, JSXGraph |
| **Backend** | Python 3, FastAPI, Uvicorn, OpenAI API |
| **Auth & BDD** | Supabase (Auth, Postgres, Realtime optionnel) |
| **Déploiement** | Frontend → **Vercel** ; Backend → **Render** (Blueprint `render.yaml`) |

---

## Structure du projet

```
├── main.py                 # Point d'entrée backend (uvicorn)
├── .env                     # Variables d'environnement (ne pas commiter)
├── render.yaml              # Blueprint Render pour déploiement backend
│
├── backend/                 # API FastAPI
│   ├── app.py               # Routes : /api/chat, /api/realtime/session, /api/realtime/connect
│   ├── config.py            # Prompts, schéma generate_graph, instructions Realtime
│   ├── supabase_client.py   # Client Supabase (service role, optionnel)
│   └── requirements.txt
│
├── frontend/                # Application React (Vite)
│   ├── src/
│   │   ├── App.jsx          # Routes et protection auth
│   │   ├── components/      # GraphPanel, ChatMessage, VoiceBars, Sidebar, etc.
│   │   ├── hooks/           # useRealtimeVoice (WebRTC + OpenAI Realtime)
│   │   ├── layouts/         # MainLayout
│   │   ├── pages/           # Home, Chat, Voice, Flashcards, Analytics, Settings, Auth
│   │   ├── store/           # authStore, chatStore, flashcardStore, profileStore
│   │   ├── utils/           # graphNormalizer (2D/3D), chart, colors
│   │   └── lib/             # supabase.js
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json          # Rewrites SPA pour Vercel
│
├── docs/                    # Documentation
│   ├── DEPLOY_VERCEL.md     # Déployer le frontend sur Vercel + VITE_API_URL
│   ├── DEPLOY_RENDER.md     # Déployer le backend sur Render (gratuit)
│   ├── VOICE_DIAGNOSTIC.md  # Dépannage mode vocal
│   ├── SUPABASE_SETUP.md    # Configuration Supabase
│   └── ...
│
├── supabase/migrations/     # Schéma BDD (profiles, conversations, messages, flashcards)
├── scripts/                  # Tests (test_api.py, test_voice.py)
└── Maquette_frontend/       # Maquettes UI
```

---

## Démarrage en local

### Prérequis

- **Python 3.10+**
- **Node.js 18+**
- Clé API **OpenAI**
- (Optionnel) Projet **Supabase** pour auth et BDD

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/Romainmlt123/MVP_Tutoria.git
cd MVP_Tutoria

# Backend
python -m venv venv
source venv/bin/activate   # Windows : venv\Scripts\activate
pip install -r backend/requirements.txt

# Frontend
cd frontend
npm install
cd ..
```

### Variables d'environnement

**À la racine** (backend), créer `.env` :

```env
OPENAI_API_KEY=sk-...
PORT=8000
HOST=0.0.0.0
DEBUG=true
```

**Dans `frontend/`** (optionnel en local), créer `frontend/.env` :

```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Sans `VITE_API_URL`, le frontend utilise par défaut `http://localhost:8000`.

### Lancer l'application

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

## Déploiement

| Cible | Plateforme | Documentation |
|-------|------------|----------------|
| **Frontend** | Vercel | [docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md) |
| **Backend** | Render | [docs/DEPLOY_RENDER.md](docs/DEPLOY_RENDER.md) |

- **Vercel** : Root Directory = `frontend`. Variables : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, **`VITE_API_URL`** (URL du backend en prod, ex. `https://tutoria-api.onrender.com`).
- **Render** : le fichier `render.yaml` à la racine permet de créer le service en un clic (Blueprint). Ajouter **OPENAI_API_KEY** dans l’onglet Environment.

Un **push** sur la branche connectée déclenche le déploiement du frontend (Vercel) et du backend (Render).

---

## API (résumé)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | Health check (déploiement, monitoring). |
| POST | `/api/chat` | Chat texte. Body : `{ "messages": [ { "role", "content" }, ... ] }`. Réponse : `{ "content", "graph" }` (extraction du bloc `jsxgraph`). |
| POST | `/api/realtime/session` | Création d’un token éphémère pour WebRTC (client_secret). |
| POST | `/api/realtime/connect` | Proxy SDP : envoi de l’offer client vers OpenAI Realtime, retour de l’answer. |

Le frontend utilise le token de session puis appelle **directement** `https://api.openai.com/v1/realtime/calls` pour le flux audio (WebRTC).

---

## Documentation

- [docs/README.md](docs/README.md) — Index de la documentation
- [docs/DEPLOY_VERCEL.md](docs/DEPLOY_VERCEL.md) — Déploiement frontend (Vercel + CORS / VITE_API_URL)
- [docs/DEPLOY_RENDER.md](docs/DEPLOY_RENDER.md) — Déploiement backend (Render, gratuit)
- [docs/VOICE_DIAGNOSTIC.md](docs/VOICE_DIAGNOSTIC.md) — Dépannage mode vocal
- [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) — Configuration Supabase
- [PATCHLOG.md](PATCHLOG.md) — Erreurs rencontrées et correctifs

---

## Licence

Projet à usage éducatif / privé.

---

**Dépôt :** [github.com/Romainmlt123/MVP_Tutoria](https://github.com/Romainmlt123/MVP_Tutoria)
