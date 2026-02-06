/* ================================================================
 * Données simulées (mock data).
 * Ce fichier est la source unique de toutes les données statiques.
 * Lors de l'intégration backend, remplacer chaque export par un appel API.
 * ================================================================ */

export const user = {
  name: 'Alexandre',
  shortName: 'Alex',
  role: 'Compte Étudiant',
  plan: 'Membre Pro',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAE_-KHvQ0dHcxMU_LxV2Rb8rddJHKGamhU5Ta1DXNGry102z3TrJYLS9lVVQBrNhVw6n4XvKacDwScVtLqhRpjcHhTNdzHRTjt4RbM8xDVqg1IxQtpBI79kBxSPFpFtJgDspioDOlXqH00LPCTrd2nWgtwuRTLyqucUQe8GFG0P_rjuzbMzWLJfDxZ0M6A00SlNHRZReQQPuSr361hKk5N1zU7uSylUKhw7IKzNOovHkb2im2M3qTRPhR0GDAbHxNrAS0oIMeEWAY',
}

/* ---- Page d'accueil ---- */

export const streakDays = [
  { label: 'L', done: true },
  { label: 'M', done: true },
  { label: 'Me', done: true },
  { label: 'J', done: true },
  { label: 'V', done: true },
  { label: 'S', done: false },
  { label: 'D', done: false },
]

export const quickAccessSubjects = [
  { name: 'Maths', subtitle: 'Calcul II', icon: 'calculate', color: 'red', slug: 'maths' },
  { name: 'Français', subtitle: 'Littérature classique', icon: 'menu_book', color: 'blue', slug: 'francais' },
  { name: 'Physique', subtitle: 'Mécanique', icon: 'science', color: 'green', slug: 'physique' },
]

/* ---- Flashcards ---- */

export const flashcardSubjects = [
  { name: 'Mathématiques', icon: 'calculate', cardsDue: 12, progress: 68, color: 'blue' },
  { name: 'Littérature', icon: 'menu_book', cardsDue: 5, progress: 45, color: 'purple' },
  { name: 'Biologie', icon: 'biotech', cardsDue: 0, progress: 92, color: 'green' },
]

export const flashcardStats = {
  currentStreak: 5,
  totalMastered: 842,
  accuracy: 94,
}

/* ---- Chat ---- */

export const chatMessages = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'Tu peux m\'expliquer la formule quadratique ?',
  },
  {
    id: 'msg-2',
    role: 'ai',
    content: 'Bien sûr ! La formule quadratique est un outil fondamental en algèbre utilisé pour résoudre les équations du second degré de la forme <code>ax² + bx + c = 0</code>.',
    hasFormula: true,
    hasFollowUp: true,
  },
  {
    id: 'msg-3',
    role: 'user',
    content: 'Montre-moi l\'implémentation en Python s\'il te plaît.',
  },
  {
    id: 'msg-4',
    role: 'ai',
    content: 'Voici une fonction Python simple utilisant le module <code>cmath</code> pour gérer également les solutions complexes :',
    hasCode: true,
    code: {
      filename: 'resolveur_quadratique.py',
      language: 'python',
      content: `import cmath

def resoudre_quadratique(a, b, c):
    # Calculer le discriminant
    d = (b**2) - (4*a*c)

    # Trouver les deux solutions
    sol1 = (-b - cmath.sqrt(d)) / (2*a)
    sol2 = (-b + cmath.sqrt(d)) / (2*a)

    return sol1, sol2`,
    },
  },
]

export const chatHistory = [
  {
    section: "Aujourd'hui",
    items: [
      { id: 'chat-1', title: 'Formule quadratique', icon: 'chat_bubble', active: true },
      { id: 'chat-2', title: 'Aide en géométrie', icon: 'chat_bubble_outline', active: false },
    ],
  },
  {
    section: 'Hier',
    items: [
      { id: 'chat-3', title: 'Analyse de Voltaire', icon: 'history_edu', active: false },
      { id: 'chat-4', title: 'Physique : Thermodynamique', icon: 'functions', active: false },
    ],
  },
  {
    section: '7 derniers jours',
    items: [
      { id: 'chat-5', title: 'Tableaux Python', icon: 'code', active: false },
    ],
  },
]

/* ---- Analytics ---- */

export const analyticsKPIs = [
  { label: 'Temps d\'étude total', value: '24h 30m', change: '+12%', changeLabel: 'vs mois dernier', icon: 'timer', bgIcon: 'schedule', color: 'primary', trend: 'up' },
  { label: 'Matières maîtrisées', value: '12', change: '+2', changeLabel: 'nouvelles matières', icon: 'school', bgIcon: 'school', color: 'purple', trend: 'up' },
  { label: 'Taux de réussite moy.', value: '88%', change: '+1,5%', changeLabel: 'amélioration', icon: 'target', bgIcon: 'analytics', color: 'orange', trend: 'up' },
  { label: 'Série en cours', value: '14 Jours', change: '+1 Jour', changeLabel: 'continue !', icon: 'local_fire_department', bgIcon: 'local_fire_department', color: 'red', trend: 'up' },
]

export const reviewItems = [
  { name: 'Équations quadratiques', subject: 'Mathématiques', icon: 'calculate', progress: 40, color: 'orange' },
  { name: 'Révolution française', subject: 'Histoire', icon: 'history_edu', progress: 65, color: 'yellow' },
  { name: 'Photosynthèse', subject: 'Biologie', icon: 'eco', progress: 80, color: 'emerald' },
]

export const radarSubjects = [
  { label: 'MATHS', value: 90 },
  { label: 'PHYS', value: 72 },
  { label: 'LITT', value: 60 },
  { label: 'HIST', value: 45 },
  { label: 'BIO', value: 78 },
  { label: 'LANG', value: 55 },
]

export const weeklyActivity = [
  { label: 'Lun', value: 10 },
  { label: 'Mar', value: 12 },
  { label: 'Mer', value: 25 },
  { label: 'Jeu', value: 15 },
  { label: 'Ven', value: 20 },
  { label: 'Sam', value: 42 },
  { label: 'Dim', value: 8 },
]

export const monthlyXP = [41, 129, 109, 57, 117, 49, 89, 105, 29, 1, 149, 69, 21, 125]

/* ---- Paramètres ---- */

export const personas = [
  { id: 'encouraging', name: 'Encourageant', icon: 'sentiment_very_satisfied', description: 'Se concentre sur la motivation et le renforcement positif. Idéal pour les nouvelles matières.' },
  { id: 'rigorous', name: 'Rigoureux', icon: 'fitness_center', description: 'Direct, stimulant et rythmé. Parfait pour la préparation aux examens.' },
  { id: 'socratic', name: 'Socratique', icon: 'lightbulb', description: 'Enseigne en posant des questions pour guider votre propre réflexion critique.' },
]
