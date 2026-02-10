-- Tutor'IA - Deck de flashcards global (visible par tous, lecture seule)
-- Prérequis : 002_flashcards.sql et 003_flashcard_cards_qcm.sql déjà exécutés

-- ============================================
-- 1. Decks globaux : user_id peut être NULL
-- ============================================
ALTER TABLE public.flashcard_decks
  ALTER COLUMN user_id DROP NOT NULL;

-- Un seul deck global par nom (évite doublons si migration relancée)
CREATE UNIQUE INDEX IF NOT EXISTS idx_flashcard_decks_global_name
  ON public.flashcard_decks (name)
  WHERE user_id IS NULL;

-- ============================================
-- 2. RLS : lecture des decks globaux pour tous
-- ============================================
DROP POLICY IF EXISTS "Users can manage own flashcard decks" ON public.flashcard_decks;
CREATE POLICY "Users can read own and global flashcard decks"
  ON public.flashcard_decks FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert own flashcard decks"
  ON public.flashcard_decks FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flashcard decks"
  ON public.flashcard_decks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own flashcard decks"
  ON public.flashcard_decks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. RLS cartes : lecture des cartes des decks globaux
-- ============================================
DROP POLICY IF EXISTS "Users can manage cards of own decks" ON public.flashcard_cards;
CREATE POLICY "Users can read cards of own and global decks"
  ON public.flashcard_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_decks d
      WHERE d.id = flashcard_cards.deck_id
        AND (d.user_id = auth.uid() OR d.user_id IS NULL)
    )
  );
CREATE POLICY "Users can insert cards in own decks only"
  ON public.flashcard_cards FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.flashcard_decks d
      WHERE d.id = flashcard_cards.deck_id AND d.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update cards in own decks only"
  ON public.flashcard_cards FOR UPDATE
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
CREATE POLICY "Users can delete cards in own decks only"
  ON public.flashcard_cards FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_decks d
      WHERE d.id = flashcard_cards.deck_id AND d.user_id = auth.uid()
    )
  );

-- ============================================
-- 4. Seed : deck global "Culture générale" + 15 cartes QCM
-- ============================================
DO $$
DECLARE
  gdeck_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.flashcard_decks WHERE user_id IS NULL AND name = 'Culture générale') THEN
    INSERT INTO public.flashcard_decks (user_id, name, icon, color)
    VALUES (NULL, 'Culture générale', 'menu_book', 'purple')
    RETURNING id INTO gdeck_id;

    INSERT INTO public.flashcard_cards (deck_id, front, back, choices, correct_index) VALUES
      (gdeck_id, 'Quelle est la formule de l''aire d''un cercle ?', 'L''aire d''un cercle est π × r², où r est le rayon. La circonférence est 2πr.', '["π × r", "π × r²", "2 × π × r", "π × d"]'::jsonb, 1),
      (gdeck_id, 'Que vaut cos(0) ?', 'cos(0) = 1. En radian, 0 correspond au point (1, 0) sur le cercle trigonométrique.', '["0", "1", "-1", "1/2"]'::jsonb, 1),
      (gdeck_id, 'Quelle est la dérivée de x³ ?', 'La dérivée de xⁿ est n·xⁿ⁻¹. Donc (x³)'' = 3x².', '["3x", "3x²", "x²", "3x³"]'::jsonb, 1),
      (gdeck_id, 'Quelle est l''unité de la force dans le SI ?', 'Le newton (N) est l''unité de force : F = m × a.', '["Joule", "Newton", "Pascal", "Watt"]'::jsonb, 1),
      (gdeck_id, 'Quelle loi relie la tension U, l''intensité I et la résistance R ?', 'Loi d''Ohm : U = R × I (en volts, ohms, ampères).', '["P = U × I", "U = R × I", "E = m × c²", "F = m × a"]'::jsonb, 1),
      (gdeck_id, 'Qui a écrit « Les Misérables » ?', 'Victor Hugo a publié Les Misérables en 1862.', '["Émile Zola", "Victor Hugo", "Gustave Flaubert", "Alexandre Dumas"]'::jsonb, 1),
      (gdeck_id, 'Quel auteur a écrit « L''Étranger » ?', 'Albert Camus a publié L''Étranger en 1942.', '["Sartre", "Camus", "Céline", "Malraux"]'::jsonb, 1),
      (gdeck_id, 'En quelle année a eu lieu la prise de la Bastille ?', 'La prise de la Bastille a lieu le 14 juillet 1789.', '["1788", "1789", "1790", "1792"]'::jsonb, 1),
      (gdeck_id, 'Quelle est la capitale de l''Australie ?', 'Canberra est la capitale fédérale de l''Australie (choisie en 1908).', '["Sydney", "Melbourne", "Canberra", "Perth"]'::jsonb, 2),
      (gdeck_id, 'Quel continent est le plus peuplé ?', 'L''Asie concentre environ 60 % de la population mondiale.', '["Afrique", "Europe", "Asie", "Amérique"]'::jsonb, 2),
      (gdeck_id, 'Quel gaz les plantes absorbent pour la photosynthèse ?', 'La photosynthèse utilise CO₂ et eau pour produire du glucose et O₂.', '["Oxygène", "Azote", "Dioxyde de carbone", "Hydrogène"]'::jsonb, 2),
      (gdeck_id, 'Combien de chromosomes ont les cellules humaines (hors gamètes) ?', 'Les cellules somatiques humaines ont 46 chromosomes (23 paires). Les gamètes en ont 23.', '["23", "46", "44", "48"]'::jsonb, 1),
      (gdeck_id, 'Que signifie l''acronyme HTML ?', 'HTML = HyperText Markup Language, langage de balisage pour le web.', '["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink Text Model Language"]'::jsonb, 0),
      (gdeck_id, 'Quel langage est souvent utilisé pour le machine learning ?', 'Python est très utilisé en data science et ML (NumPy, TensorFlow, etc.).', '["Java", "C++", "Python", "PHP"]'::jsonb, 2),
      (gdeck_id, 'Qu''est-ce qu''une API ?', 'API = Application Programming Interface : interface pour que des programmes échangent des données.', '["Un langage de programmation", "Une interface qui permet à des logiciels de communiquer", "Un type de base de données", "Un système d''exploitation"]'::jsonb, 1);
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
