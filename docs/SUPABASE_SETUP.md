# Supabase — Base de données Tutor'IA

Supabase fournit une **PostgreSQL** hébergée + **Auth** (utilisateurs, sessions) + **Realtime** (optionnel). On l’utilise pour stocker **utilisateurs** (Auth), **conversations**, **messages** et **paramètres** (tables custom).

---

## 1. Créer un projet Supabase

1. Va sur [supabase.com/dashboard](https://supabase.com/dashboard) et crée un projet (organisation + nom, ex. `TutorIA`).
2. Récupère les clés dans **Project Settings → API** :
   - **Project URL** (ex. `https://xxxxx.supabase.co`)
   - **anon / public** : pour le frontend (exposé au navigateur, respecte les RLS).
   - **service_role** : pour le backend (accès complet, **ne jamais exposer côté client**).

---

## 2. Variables d’environnement

**Racine du projet (backend)** — `.env` :

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Frontend** — `frontend/.env` ou `frontend/.env.local` :

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 3. Schéma SQL (à exécuter dans Supabase → SQL Editor)

Exécute le script suivant dans **Supabase Dashboard → SQL Editor** pour créer les tables et les politiques RLS.

```sql
-- ============================================
-- PROFILES (extension de auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger: créer un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- CONVERSATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Nouvelle conversation',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversations"
  ON public.conversations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL DEFAULT '',
  graph JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage messages of own conversations"
  ON public.messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()
    )
  );

-- ============================================
-- USER_SETTINGS (optionnel, si pas dans profiles.settings)
-- ============================================
-- On peut tout mettre dans profiles.settings (JSONB). Sinon table dédiée :
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  language TEXT DEFAULT 'fr',
  notifications_enabled BOOLEAN DEFAULT true,
  extra JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own settings"
  ON public.user_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## 3.1. Migrations Flashcards (optionnel)

Si tu utilises la section Flashcards, exécute dans l’ordre dans **SQL Editor** :

1. **`supabase/migrations/001_initial.sql`** — profiles, conversations, etc. (déjà couvert ci‑dessus si tu as tout copié).
2. **`supabase/migrations/002_flashcards.sql`** — tables `flashcard_decks`, `flashcard_cards`, `flashcard_reviews` + RLS.
3. **`supabase/migrations/003_flashcard_cards_qcm.sql`** — colonnes QCM (`choices`, `correct_index`) sur les cartes.
4. **`supabase/migrations/004_global_flashcard_deck.sql`** — deck **global** « Culture générale » (15 cartes QCM) visible par tous les utilisateurs, en lecture seule. Après cette migration, chaque utilisateur voit ce deck en plus de ses propres decks au refresh.

---

## 4. Utilisation côté app

| Côté | Rôle | Clé | Usage |
|------|------|-----|--------|
| **Frontend (React)** | Auth + lecture/écriture données utilisateur | `anon` (publishable) | `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)`. Auth (login/signup), `from('conversations')`, `from('messages')`. RLS limite aux lignes de l’utilisateur connecté. |
| **Backend (FastAPI)** | Opérations serveur (quota, admin) | `service_role` | `create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)`. Pour compter les messages, insérer côté serveur si besoin, etc. Ne jamais exposer cette clé au client. |

- **Auth** : gérée côté frontend avec Supabase Auth (email/mot de passe, magic link, ou OAuth). Le JWT est envoyé au backend si tu veux vérifier l’utilisateur (middleware FastAPI).
- **Conversations / messages** : le frontend peut tout faire avec le client Supabase + RLS (créer conversation, ajouter messages, charger historique). Le backend reste responsable d’OpenAI ; il peut recevoir `conversation_id` ou `user_id` pour enregistrer les messages côté serveur si tu préfères.

---

## 5. Références

- [Supabase Auth + React](https://supabase.com/docs/guides/auth/quickstarts/react)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Python Client](https://supabase.com/docs/reference/python/initializing) (backend)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
