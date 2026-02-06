# Configuration du dépôt GitHub

Ce document décrit comment lier le projet au dépôt [MVP_Tutoria](https://github.com/Romainmlt123/MVP_Tutoria) et pousser le code.

---

## Prérequis

- **Git** installé : `sudo apt install git` (Linux) ou [git-scm.com](https://git-scm.com/) (Windows/Mac).
- Un compte GitHub et le dépôt créé : [https://github.com/Romainmlt123/MVP_Tutoria](https://github.com/Romainmlt123/MVP_Tutoria).

---

## Première fois (depuis ce projet existant)

À la **racine du projet** (`Frontend_tutoria`) :

```bash
# 1. Initialiser Git (si pas déjà fait)
git init

# 2. Vérifier le .gitignore à la racine (exclut .env, venv, node_modules, etc.)
cat .gitignore

# 3. Ajouter le remote
git remote add origin https://github.com/Romainmlt123/MVP_Tutoria.git

# 4. Ajouter tous les fichiers (respect du .gitignore)
git add .

# 5. Premier commit
git commit -m "Initial commit: Tutor'IA - chat, mode vocal, graphiques 2D/3D"

# 6. Branche par défaut (souvent main)
git branch -M main

# 7. Pousser vers GitHub (le dépôt peut être vide au départ)
git push -u origin main
```

Si le dépôt GitHub a déjà un `README` ou une licence, tu peux faire un `git pull origin main --rebase` avant le premier `git push`, ou accepter d’écraser avec `git push -u origin main --force` (à utiliser avec précaution).

---

## Ensuite (travail au quotidien)

```bash
git add .
git commit -m "Description courte des changements"
git push
```

---

## Fichiers sensibles (ne doivent pas être poussés)

Le fichier **`.gitignore`** à la racine exclut notamment :

- `.env` (clés API)
- `venv/`
- `frontend/node_modules/`
- `frontend/dist/`
- `__pycache__/`

Vérifier qu’aucun fichier contenant des secrets n’est suivi : `git status` puis `git diff` si besoin.

---

## Lien du dépôt

- **HTTPS :** `https://github.com/Romainmlt123/MVP_Tutoria.git`
- **Page projet :** [https://github.com/Romainmlt123/MVP_Tutoria](https://github.com/Romainmlt123/MVP_Tutoria)
