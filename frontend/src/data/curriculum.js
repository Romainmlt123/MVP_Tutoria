/**
 * Curriculum par matière et classe (programmes officiels).
 * Structure : curriculum[subjectId][grade] = { chapters: [...] }
 * chapter = { id, name, nodes: [{ type: 'lesson'|'exercise'|'boss', title, promptContext }] }
 */

const GRADES = ['2nde', '1ere', 'terminale']

/** Maths 2nde - 6 domaines du programme officiel (annexe BO) */
const MATHS_2NDE = {
  chapters: [
    {
      id: 'nombres-calculs',
      name: 'Nombres et calculs',
      nodes: [
        { type: 'lesson', title: 'Ensembles de nombres', promptContext: 'Leçon sur les ensembles de nombres (N, Z, D, Q, R) et leurs notations. Programme Maths 2nde.' },
        { type: 'lesson', title: 'Calcul algébrique', promptContext: 'Leçon sur le calcul algébrique et les expressions littérales. Programme Maths 2nde.' },
        { type: 'exercise', title: 'Équations du 1er degré', promptContext: "Exercice sur la résolution d'équations du premier degré. Programme Maths 2nde - Nombres et calculs." },
        { type: 'lesson', title: 'Inéquations et règles sur les inégalités', promptContext: 'Leçon sur les inéquations du premier degré et les règles sur les inégalités. Programme Maths 2nde.' },
        { type: 'boss', title: 'Évaluation Nombres et calculs', promptContext: "Évaluation sur les nombres et calculs (ensembles, équations, inéquations). Programme Maths 2nde. L'élève souhaite être évalué." },
      ],
    },
    {
      id: 'geometrie',
      name: 'Géométrie',
      nodes: [
        { type: 'lesson', title: 'Vecteurs du plan', promptContext: 'Leçon sur les vecteurs du plan (définition, opérations, colinéarité). Programme Maths 2nde.' },
        { type: 'lesson', title: 'Configurations géométriques', promptContext: 'Leçon sur les configurations géométriques (théorème de Thalès, Pythagore). Programme Maths 2nde.' },
        { type: 'exercise', title: 'Ensembles de points', promptContext: "Exercice sur les ensembles de points du plan décrits par une équation. Programme Maths 2nde - Géométrie." },
        { type: 'boss', title: 'Évaluation Géométrie', promptContext: "Évaluation sur la géométrie (vecteurs, configurations). Programme Maths 2nde. L'élève souhaite être évalué." },
      ],
    },
    {
      id: 'fonctions',
      name: 'Fonctions',
      nodes: [
        { type: 'lesson', title: 'Notion de fonction', promptContext: 'Leçon sur la notion de fonction et la dépendance entre variables. Programme Maths 2nde.' },
        { type: 'lesson', title: 'Fonctions de référence', promptContext: 'Leçon sur les fonctions de référence (affine, carré, inverse). Programme Maths 2nde.' },
        { type: 'exercise', title: 'Variations et extremums', promptContext: "Exercice sur les variations et extremums de fonctions. Programme Maths 2nde - Fonctions." },
        { type: 'boss', title: 'Évaluation Fonctions', promptContext: "Évaluation sur les fonctions (notion, référence, variations). Programme Maths 2nde. L'élève souhaite être évalué." },
      ],
    },
    {
      id: 'statistiques-probabilites',
      name: 'Statistiques et probabilités',
      nodes: [
        { type: 'lesson', title: 'Indicateurs de tendance centrale', promptContext: 'Leçon sur les indicateurs de tendance centrale (moyenne pondérée). Programme Maths 2nde.' },
        { type: 'lesson', title: 'Indicateurs de dispersion', promptContext: 'Leçon sur les indicateurs de dispersion (écart interquartile, écart type). Programme Maths 2nde.' },
        { type: 'exercise', title: 'Proportions et évolutions', promptContext: "Exercice sur les proportions, pourcentages et coefficients multiplicateurs. Programme Maths 2nde - Statistiques." },
        { type: 'boss', title: 'Évaluation Statistiques', promptContext: "Évaluation sur les statistiques et probabilités. Programme Maths 2nde. L'élève souhaite être évalué." },
      ],
    },
    {
      id: 'algorithmique',
      name: 'Algorithmique et programmation',
      nodes: [
        { type: 'lesson', title: 'Bases de la programmation', promptContext: 'Leçon sur l\'écriture de programmes informatiques simples. Programme Maths 2nde.' },
        { type: 'lesson', title: 'Introduction à Python', promptContext: 'Leçon sur le langage Python (variables, boucles, conditions). Programme Maths 2nde.' },
        { type: 'exercise', title: 'Programmer un algorithme', promptContext: "Exercice de programmation en Python. Programme Maths 2nde - Algorithmique." },
        { type: 'boss', title: 'Évaluation Algorithmique', promptContext: "Évaluation sur l'algorithmique et la programmation. Programme Maths 2nde. L'élève souhaite être évalué." },
      ],
    },
    {
      id: 'vocabulaire-ensembliste',
      name: 'Vocabulaire ensembliste et logique',
      nodes: [
        { type: 'lesson', title: 'Vocabulaire ensembliste', promptContext: 'Leçon sur le vocabulaire ensembliste (appartenance, inclusion, intersection, union). Programme Maths 2nde.' },
        { type: 'lesson', title: 'Logique et raisonnement', promptContext: 'Leçon sur la logique et le raisonnement mathématique. Programme Maths 2nde.' },
        { type: 'exercise', title: 'Appliquer le vocabulaire', promptContext: "Exercice sur le vocabulaire ensembliste et logique. Programme Maths 2nde." },
        { type: 'boss', title: 'Évaluation Vocabulaire et logique', promptContext: "Évaluation sur le vocabulaire ensembliste et la logique. Programme Maths 2nde. L'élève souhaite être évalué." },
      ],
    },
  ],
}

/** Curriculum par matière et classe */
export const curriculum = {
  maths: {
    '2nde': MATHS_2NDE,
    '1ere': null,
    terminale: null,
  },
  francais: {
    '2nde': null,
    '1ere': null,
    terminale: null,
  },
  physique: {
    '2nde': null,
    '1ere': null,
    terminale: null,
  },
  svt: {
    '2nde': null,
    '1ere': null,
    terminale: null,
  },
  histoire: {
    '2nde': null,
    '1ere': null,
    terminale: null,
  },
  anglais: {
    '2nde': null,
    '1ere': null,
    terminale: null,
  },
}

export const GRADE_LABELS = {
  '2nde': 'Seconde',
  '1ere': 'Première',
  terminale: 'Terminale',
}

/**
 * Récupère le curriculum pour une matière et une classe.
 * @param {string} subjectId - maths, francais, etc.
 * @param {string} grade - 2nde, 1ere, terminale
 * @returns {{ chapters: Array }|null}
 */
export function getCurriculum(subjectId, grade) {
  const g = (grade || '2nde').replace('è', 'e').replace('È', 'e').toLowerCase()
  const normalizedGrade = g === '1ere' || g === '1ère' ? '1ere' : g === 'terminale' ? 'terminale' : '2nde'
  const subject = curriculum[subjectId]
  if (!subject) return null
  return subject[normalizedGrade] ?? null
}

/**
 * Récupère un chapitre par son id.
 */
export function getChapter(subjectId, grade, chapterId) {
  const data = getCurriculum(subjectId, grade)
  if (!data?.chapters) return null
  return data.chapters.find((c) => c.id === chapterId) ?? null
}

/** Premier chapitre du programme (parcours direct depuis l’île, sans carte matière). */
export function getDefaultChapterId(subjectId, grade) {
  const data = getCurriculum(subjectId, grade)
  const first = data?.chapters?.[0]
  return first?.id ?? null
}

/** Sujets disponibles pour l'Explorer (avec image si disponible) */
export const EXPLORER_SUBJECTS = [
  { id: 'maths', label: 'Mathématiques', icon: 'calculate', emoji: '📐', hasCurriculum: true },
  { id: 'francais', label: 'Français', icon: 'menu_book', emoji: '📚', hasCurriculum: false },
  { id: 'physique', label: 'Physique', icon: 'science', emoji: '⚛️', hasCurriculum: false },
  { id: 'svt', label: 'SVT / Biologie', icon: 'biotech', emoji: '🧬', hasCurriculum: false },
  { id: 'histoire', label: 'Histoire-Géo', icon: 'public', emoji: '🌍', hasCurriculum: false },
  { id: 'anglais', label: 'Anglais', icon: 'language', emoji: '🇬🇧', hasCurriculum: false },
]
