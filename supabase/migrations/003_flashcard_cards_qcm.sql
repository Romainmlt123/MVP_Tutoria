-- Tutor'IA - Flashcards QCM (4 réponses + explication)
-- Ajoute choices (JSONB) et correct_index (0-3) à flashcard_cards.
-- back = explication affichée quand la réponse est fausse.

ALTER TABLE public.flashcard_cards
  ADD COLUMN IF NOT EXISTS choices JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS correct_index SMALLINT DEFAULT NULL;

COMMENT ON COLUMN public.flashcard_cards.choices IS 'Tableau de 4 chaînes : les 4 réponses possibles (QCM)';
COMMENT ON COLUMN public.flashcard_cards.correct_index IS 'Index de la bonne réponse (0 à 3) dans choices';

NOTIFY pgrst, 'reload schema';
