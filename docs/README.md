# Documentation Tutor'IA

Index de la documentation du projet.

---

## 📋 Documents

| Document | Description |
|----------|-------------|
| **[VOICE_DIAGNOSTIC.md](VOICE_DIAGNOSTIC.md)** | Dépannage du mode vocal : micro, permissions, logs console, tests. |
| **[SETUP_GITHUB.md](SETUP_GITHUB.md)** | Configuration du dépôt GitHub : remote, premier push. |
| **[../README.md](../README.md)** | README principal : installation, structure, API. |
| **[../PATCHLOG.md](../PATCHLOG.md)** | Patchlog : erreurs rencontrées et comment elles ont été résolues. |

---

## 🏗 Architecture rapide

- **Backend** : FastAPI, endpoints `/api/chat` et `/api/realtime/session` (token éphémère OpenAI).
- **Frontend** : React (Vite), Zustand, React Router. Mode vocal : WebRTC + appel direct à `api.openai.com/v1/realtime/calls` avec le token de session.
- **Graphiques** : Données normalisées côté frontend (`graphNormalizer.js`), rendu 2D/3D avec JSXGraph dans `GraphPanel`.

Pour plus de détails, voir le [README principal](../README.md).
