# Déployer le backend Tutor'IA sur Render

Guide pour mettre l’API FastAPI (chat texte, graphiques, mode vocal) en ligne sur **Render**, gratuitement, avec mise à jour automatique à chaque push.

---

## 1. Prérequis

- Un compte [Render](https://render.com) (gratuit)
- Le projet sur **GitHub** (même repo que le frontend)
- Une clé API **OpenAI** (`OPENAI_API_KEY`)

---

## 2. Créer un Web Service sur Render

Deux options : **manuel** (étape par étape) ou **Blueprint** (si le repo contient déjà `render.yaml`).

### Option A : Déploiement avec le Blueprint (recommandé si tu as pushé `render.yaml`)

1. Va sur [dashboard.render.com](https://dashboard.render.com) → **New +** → **Blueprint**.
2. Connecte le repo GitHub (le même que pour Vercel).
3. Render détecte le fichier `render.yaml` à la racine et propose de créer le service **tutoria-api** avec la bonne commande de build et de start.
4. Valide la création, puis dans le service créé : **Environment** → ajoute **OPENAI_API_KEY** (Secret) avec ta clé OpenAI.
5. Le premier déploiement se lance ; à la fin, note l’URL du type `https://tutoria-api.onrender.com`.

### Option B : Création manuelle du Web Service

1. Va sur [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**.

2. **Connecte ton repo GitHub**  
   - Si ce n’est pas déjà fait : **Connect account** (GitHub), choisis ton organisation/user puis le repo (ex. `MVP_Tutoria` ou `Frontend_tutoria`).  
   - Sélectionne le **même repo** que celui utilisé pour le frontend sur Vercel.

3. **Paramètres du service**
   - **Name** : `tutoria-api` (ou un autre nom).
   - **Region** : choisir la plus proche (ex. Frankfurt).
   - **Root Directory** : **laisser vide** (le backend est à la racine avec `main.py` et le dossier `backend/`).
   - **Runtime** : **Python 3**.
   - **Build Command** :
     ```bash
     pip install -r backend/requirements.txt
     ```
   - **Start Command** :
     ```bash
     python main.py
     ```
   - **Instance Type** : **Free** (le service s’endort après ~15 min d’inactivité ; le premier appel après peut prendre quelques secondes).

4. **Variables d’environnement**  
   Dans la section **Environment** (ou **Environment Variables**), ajoute :

   | Key                | Value                    | Secret ? |
   |--------------------|--------------------------|----------|
   | `OPENAI_API_KEY`   | `sk-...` (ta clé OpenAI) | Oui      |
   | `DEBUG`            | `false`                  | Non      |

   - `PORT` : **ne pas définir** — Render l’injecte automatiquement ; `main.py` l’utilise déjà.
   - Si plus tard ton backend utilise Supabase côté serveur : ajoute `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`.

5. Clique sur **Create Web Service**.  
   Render lance le premier build puis le déploiement. À la fin, tu obtiens une URL du type :
   ```text
   https://tutoria-api.onrender.com
   ```
   (sans slash à la fin)

6. **Vérifier que l’API répond**  
   Ouvre dans le navigateur :
   ```text
   https://ton-service.onrender.com/health
   ```
   Tu dois voir quelque chose comme : `{"status":"ok","service":"TutorIA"}`.

---

## 3. Brancher le frontend (Vercel) à cette API

1. Dans le **projet Vercel** du frontend (mvp-tutoria) : **Settings** → **Environment Variables**.
2. Ajoute (ou modifie) :
   - **Key** : `VITE_API_URL`
   - **Value** : `https://tutoria-api.onrender.com` (remplace par ton URL Render, **sans** slash final).
   - **Environments** : Production + Preview.
3. **Redeploy** le frontend (Deployments → … → Redeploy) pour que le build prenne la nouvelle valeur.

Après ça, le chat, les graphiques et le mode vocal utiliseront ton API sur Render.

---

## 4. Comportement au push (Git)

- **Render** : à chaque push sur la branche connectée (souvent `main` ou `dev`), Render refait un build et redéploie le backend.
- **Vercel** : idem pour le frontend.

Si les deux sont connectés au **même repo** (Vercel avec Root Directory = `frontend`, Render avec Root Directory vide et build/start ci-dessus), **un seul push met à jour les deux**.

---

## 5. Limites du tier gratuit Render

- Le service **s’endort** après environ 15 minutes sans requête.
- Le **premier appel** après réveil peut prendre 30–60 secondes (cold start).
- Pas de carte bancaire requise pour le tier Free.

---

## 6. Dépannage

- **Build échoue** : vérifier que `backend/requirements.txt` existe et que la commande est bien `pip install -r backend/requirements.txt` (depuis la racine du repo).
- **Service ne démarre pas** : vérifier les logs dans l’onglet **Logs** du service Render ; s’assurer que `OPENAI_API_KEY` est défini et que `DEBUG` est à `false`.
- **CORS** : le backend FastAPI autorise déjà toutes les origines (`allow_origins=["*"]`). Si tu restreins plus tard, ajoute `https://mvp-tutoria.vercel.app` (et ton domaine de preview) dans `allow_origins`.

Tu peux partager l’URL du backend (ex. `https://tutoria-api.onrender.com`) pour l’utiliser depuis d’autres clients (Postman, autre front, etc.).
