import {
  buildUserContextForPrompt,
  GRADE_LABELS,
  LEARNING_LABELS,
  SUBJECT_LABELS,
} from '../../utils/onboardingContext'

const POINT_TYPE_LABELS = {
  lesson: 'Leçon',
  exercise: 'Exercice',
  boss: 'Évaluation',
}

const POINT_TYPE_INSTRUCTIONS = {
  lesson:
    "C'est une leçon : explique les notions progressivement, avec des exemples adaptés au niveau de l'élève, et vérifie sa compréhension.",
  exercise:
    "C'est un exercice : guide l'élève pas à pas sans donner la réponse d'emblée ; propose des indices si nécessaire.",
  boss: "C'est une évaluation : pose des questions pour tester la maîtrise du chapitre, corrige avec bienveillance et synthétise les points à revoir.",
}

/**
 * Contexte du point Explorer (injecté en sessionContext ; le profil élève est ajouté côté chatStore).
 * @param {{
 *   node: { type: string, title: string, promptContext: string },
 *   chapter: { name: string },
 *   subjectId: string,
 *   grade: string,
 *   levelIndex: number,
 * }} params
 */
export function buildExplorerPointContext({ node, chapter, subjectId, grade, levelIndex }) {
  const typeLabel = POINT_TYPE_LABELS[node.type] || node.type
  const subjectLabel = SUBJECT_LABELS[subjectId] || subjectId
  const gradeLabel = GRADE_LABELS[grade] || grade
  const instruction = POINT_TYPE_INSTRUCTIONS[node.type] || ''

  return [
    `[Parcours Explorer — point sélectionné]`,
    `Numéro du point sur le parcours : ${levelIndex + 1}.`,
    `Type : ${typeLabel}.`,
    `Titre : ${node.title}.`,
    `Chapitre : ${chapter.name}.`,
    `Matière : ${subjectLabel}. Classe : ${gradeLabel}.`,
    `Contenu pédagogique attendu : ${node.promptContext}`,
    instruction,
  ]
    .filter(Boolean)
    .join(' ')
}

/**
 * Contexte complet (profil + point) si besoin hors chatStore.
 */
export function buildExplorerFullContext(profile, pointParams) {
  const userContext = buildUserContextForPrompt(profile)
  const pointContext = buildExplorerPointContext(pointParams)
  return [userContext, pointContext].filter(Boolean).join('\n\n')
}

export { POINT_TYPE_LABELS, POINT_TYPE_INSTRUCTIONS, LEARNING_LABELS, SUBJECT_LABELS, GRADE_LABELS }
