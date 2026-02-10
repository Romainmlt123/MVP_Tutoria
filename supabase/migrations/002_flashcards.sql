-- Tutor'IA - Flashcards (decks, cartes, révisions)
-- Exécuter dans Supabase Dashboard → SQL Editor, ou via Supabase CLI : supabase db push

-- ============================================
-- FLASHCARD_DECKS
-- ============================================
CREATE TABLE IF NOT EXISTS public.flashcard_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Nouveau dossier',
  icon TEXT DEFAULT 'style',
  color TEXT DEFAULT 'blue',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user_id ON public.flashcard_decks(user_id);

ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own flashcard decks" ON public.flashcard_decks;
CREATE POLICY "Users can manage own flashcard decks"
  ON public.flashcard_decks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FLASHCARD_CARDS
-- ============================================
CREATE TABLE IF NOT EXISTS public.flashcard_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL DEFAULT '',
  back TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flashcard_cards_deck_id ON public.flashcard_cards(deck_id);

ALTER TABLE public.flashcard_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage cards of own decks" ON public.flashcard_cards;
CREATE POLICY "Users can manage cards of own decks"
  ON public.flashcard_cards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_decks d
      WHERE d.id = flashcard_cards.deck_id AND d.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.flashcard_decks d
      WHERE d.id = flashcard_cards.deck_id AND d.user_id = auth.uid()
    )
  );

-- ============================================
-- FLASHCARD_REVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS public.flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES public.flashcard_cards(id) ON DELETE CASCADE,
  reviewed_at TIMESTAMPTZ DEFAULT now(),
  correct BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_user_id ON public.flashcard_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_card_id ON public.flashcard_reviews(card_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_reviewed_at ON public.flashcard_reviews(reviewed_at);

ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own flashcard reviews" ON public.flashcard_reviews;
CREATE POLICY "Users can manage own flashcard reviews"
  ON public.flashcard_reviews FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Recharger le cache du schéma PostgREST (API Supabase) pour que les nouvelles tables soient visibles tout de suite
NOTIFY pgrst, 'reload schema';
