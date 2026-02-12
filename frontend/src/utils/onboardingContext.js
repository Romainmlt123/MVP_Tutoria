/**
 * Construit une chaîne de contexte utilisateur (onboarding) pour le prompt système (chat + voix).
 * Utilisé par chatStore et useRealtimeVoice.
 */

export const SUBJECT_LABELS = {
  maths: 'Mathématiques',
  francais: 'Français',
  physique: 'Physique',
  svt: 'SVT / Biologie',
  histoire: 'Histoire-Géo',
  anglais: 'Anglais',
}

export const LEVEL_LABELS = {
  1: 'Débutant',
  2: 'Élémentaire',
  3: 'Intermédiaire',
  4: 'Avancé',
  5: 'Expert',
}

export const LEARNING_LABELS = {
  diagrams: 'Schémas et visuels',
  examples: 'Exemples concrets',
  exercises: 'Exercices pratiques',
  repetition: 'Répétition / révisions',
}

/**
 * @param {object} profile - profile Supabase (avec settings.onboarding)
 * @returns {string} Contexte à injecter dans le prompt système, ou '' si pas d'onboarding
 */
export function buildUserContextForPrompt(profile) {
  const onboarding = profile?.settings?.onboarding
  if (!onboarding || !onboarding.completed) return ''

  const parts = []

  const firstName = (onboarding.firstName || '').trim()
  const lastName = (onboarding.lastName || '').trim()
  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  if (fullName) parts.push(`Prénom / nom : ${fullName}.`)

  if (onboarding.levels && typeof onboarding.levels === 'object') {
    const levelParts = Object.entries(onboarding.levels)
      .filter(([, v]) => typeof v === 'number' && v >= 1 && v <= 5)
      .map(([k, v]) => `${SUBJECT_LABELS[k] || k} : ${LEVEL_LABELS[v] || v}`)
    if (levelParts.length > 0) {
      parts.push(`Niveaux par matière : ${levelParts.join(', ')}.`)
    }
  }

  if (onboarding.learningStyle && typeof onboarding.learningStyle === 'object') {
    const preferred = Object.entries(onboarding.learningStyle)
      .filter(([, v]) => v === true)
      .map(([k]) => LEARNING_LABELS[k] || k)
    if (preferred.length > 0) {
      parts.push(`Préfère apprendre avec : ${preferred.join(', ')}. Adapte tes explications en conséquence (plus de schémas si schémas coché, plus d'exemples si exemples coché, etc.).`)
    }
  }

  return parts.join(' ')
}
