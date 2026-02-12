# Déployer Tutor'IA sur Vercel

Pour mettre l’app en ligne et permettre à d’autres d’y accéder (retours, tests), déploie le **frontend** sur Vercel. L’auth, le chat et les flashcards passent par Supabase (côté client), donc tout fonctionne sans déployer le backend.

---

## 1. Prérequis

- Un compte [Vercel](https://vercel.com)
- Le projet sur GitHub (ex. `Romainmlt123/MVP_Tutoria`)

---

## 2. Importer le projet sur Vercel

1. Va sur [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Importe le repo GitHub **MVP_Tutoria** (autorise Vercel si besoin).
3. **Important** : dans les paramètres du projet, définis le **Root Directory** :
   - Clique sur **Edit** à côté de "Root Directory".
   - Choisis **`frontend`** (et non la racine du repo).
4. Vercel détecte Vite : **Framework Preset** = Vite, **Build Command** = `npm run build`, **Output Directory** = `dist`. Tu peux laisser par défaut.

---

## 3. Variables d’environnement

Dans **Settings** du projet Vercel → **Environment Variables**, ajoute :

| Nom | Valeur | Environnement |
|-----|--------|----------------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` (ton URL Supabase) | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (ta clé anon Supabase) | Production, Preview |
| `VITE_API_URL` | URL publique de ton backend (voir ci‑dessous) | Production, Preview |

**À propos de `VITE_API_URL`** (chat, graphiques, voix) : sans cette variable, le build garde le fallback `http://localhost:8000`. En prod, le navigateur bloquera les requêtes vers localhost avec une erreur CORS / *"Permission was denied for this request to access the loopback address space"*. Déploie d’abord le backend (dossier `backend/`) sur Railway, Render, Fly.io, etc., puis ajoute ici l’URL de l’API. Après modification, fais un **Redeploy** du projet sur Vercel.

---

## 4. Déployer

- **Premier déploiement** : après avoir sauvegardé les variables, clique sur **Deploy**.
- **Ensuite** : chaque push sur la branche connectée (ex. `main` ou `dev`) déclenche un nouveau déploiement si l’option est activée (par défaut oui).

Une fois le build terminé, Vercel te donne une URL du type `https://mvp-tutoria-xxx.vercel.app`.

---

## 5. Récap

- **Root Directory** = `frontend`.
- **Variables** = `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` et `VITE_API_URL` (obligatoire pour chat / graphiques / voix en prod).
- Le fichier `frontend/vercel.json` configure les rewrites pour que React Router gère toutes les routes (SPA).

Tu peux partager l’URL de production pour que d’autres testent et donnent des retours.
