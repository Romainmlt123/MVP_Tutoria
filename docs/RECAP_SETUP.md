# Récap — Ce qu’il faut faire (Tutor'IA)

Résumé des étapes pour que le projet (auth, chat, flashcards, deck global) fonctionne avec Supabase.

---

## 1. Projet Supabase

- Créer un projet sur [supabase.com/dashboard](https://supabase.com/dashboard).
- Noter **Project URL** et **anon key** dans **Project Settings → API**.

---

## 2. Variables d’environnement

**Racine du projet** — `.env` (backend) :

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Frontend** — `frontend/.env` :

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

Les URLs et clés doivent correspondre **au même projet** Supabase.

---

## 3. Migrations SQL (à exécuter dans l’ordre)

Ouvrir **Supabase Dashboard → SQL Editor** et exécuter chaque fichier **dans cet ordre** :

| Ordre | Fichier | Rôle |
|-------|---------|------|
| 1 | `supabase/migrations/001_initial.sql` | Profiles, conversations, messages, user_settings, triggers, RLS |
| 2 | `supabase/migrations/002_flashcards.sql` | Tables `flashcard_decks`, `flashcard_cards`, `flashcard_reviews` + RLS |
| 3 | `supabase/migrations/003_flashcard_cards_qcm.sql` | Colonnes QCM sur les cartes : `choices`, `correct_index` |
| 4 | `supabase/migrations/004_global_flashcard_deck.sql` | Deck global « Culture générale » (15 cartes), visible par tous en lecture seule |

**Comment faire :** ouvrir chaque fichier, tout copier, coller dans le SQL Editor, exécuter. En cas d’erreur "policy already exists" sur 002, c’est que les policies existent déjà (normal si tu as déjà exécuté 002).

---

## 4. Vérifications après les migrations

- **Auth** : inscription / connexion / déconnexion.
- **Profil** : affichage et édition dans Paramètres.
- **Chat** : conversations et messages en base.
- **Flashcards** :
  - Tes decks persos + deck **« Culture générale »** (badge **Global**) dans la bibliothèque.
  - Révision possible sur tous les decks ; ajout / modification / suppression uniquement sur tes decks.

---

## 5. MCP Supabase (optionnel)

- Le MCP Supabase est configuré dans Cursor (`~/.cursor/mcp.json`) mais demande une **authentification**.
- Sans auth, **aucun outil Supabase** n’est disponible pour l’assistant ; les migrations restent à faire à la main dans le SQL Editor.
- Pour l’utiliser : **Cursor → Paramètres → MCP** → ouvrir la config du serveur Supabase et suivre la procédure d’authentification (lien Supabase / token). Une fois connecté, l’assistant pourra éventuellement exécuter du SQL ou des migrations via le MCP.

---

## En bref

1. Créer le projet Supabase et remplir `.env` + `frontend/.env`.
2. Exécuter les 4 migrations dans l’ordre dans le SQL Editor.
3. Lancer le frontend : tu dois voir le deck global « Culture générale » après un refresh, en plus de tes decks.

Pour plus de détail sur le schéma et les policies, voir `docs/SUPABASE_SETUP.md`.
