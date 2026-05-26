import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import useAuthStore from '../store/authStore'
import useProfileStore from '../store/profileStore'

const SUBJECTS = [
  { id: 'maths', label: 'Mathématiques', icon: 'calculate', emoji: '📐' },
  { id: 'francais', label: 'Français', icon: 'menu_book', emoji: '📚' },
  { id: 'physique', label: 'Physique', icon: 'science', emoji: '⚛️' },
  { id: 'svt', label: 'SVT / Biologie', icon: 'biotech', emoji: '🧬' },
  { id: 'histoire', label: 'Histoire-Géo', icon: 'public', emoji: '🌍' },
  { id: 'anglais', label: 'Anglais', icon: 'language', emoji: '🇬🇧' },
]

const LEVELS = [
  { value: 1, label: 'Débutant', short: 'Déb.' },
  { value: 2, label: 'Élémentaire', short: 'Élém.' },
  { value: 3, label: 'Intermédiaire', short: 'Interm.' },
  { value: 4, label: 'Avancé', short: 'Avancé' },
  { value: 5, label: 'Expert', short: 'Expert' },
]

const LEARNING_OPTIONS = [
  { id: 'diagrams', label: 'Schémas & visuels', icon: 'insights', emoji: '📊' },
  { id: 'examples', label: 'Exemples concrets', icon: 'lightbulb', emoji: '💡' },
  { id: 'exercises', label: 'Exercices', icon: 'fitness_center', emoji: '✏️' },
  { id: 'repetition', label: 'Répétition', icon: 'replay', emoji: '🔄' },
]

const GRADES = [
  { id: '2nde', label: 'Seconde' },
  { id: '1ere', label: 'Première' },
  { id: 'terminale', label: 'Terminale' },
]

const TOTAL_STEPS = 4

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { profile, fetchProfile, updateOnboarding } = useProfileStore()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user?.id) fetchProfile(user.id)
  }, [user?.id, fetchProfile])

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [grade, setGrade] = useState('2nde')
  const [levels, setLevels] = useState(
    SUBJECTS.reduce((acc, s) => ({ ...acc, [s.id]: 3 }), {})
  )
  const [learningStyle, setLearningStyle] = useState(
    LEARNING_OPTIONS.reduce((acc, o) => ({ ...acc, [o.id]: true }), {})
  )

  // Pré-remplir le formulaire depuis le profil (pour modifier l'onboarding)
  useEffect(() => {
    const o = profile?.settings?.onboarding
    if (!o) return
    if (o.firstName) setFirstName(o.firstName)
    if (o.lastName) setLastName(o.lastName)
    if (o.grade) setGrade(o.grade === '1ère' ? '1ere' : o.grade || '2nde')
    if (o.levels && typeof o.levels === 'object') {
      setLevels((prev) => ({ ...prev, ...o.levels }))
    }
    if (o.learningStyle && typeof o.learningStyle === 'object') {
      setLearningStyle((prev) => ({ ...prev, ...o.learningStyle }))
    }
  }, [profile?.settings?.onboarding])

  const canNextStep1 = firstName.trim().length > 0
  const handleNext = () => {
    setError(null)
    if (step < TOTAL_STEPS) setStep(step + 1)
    else handleFinish()
  }

  const handleBack = () => {
    setError(null)
    if (step > 1) setStep(step - 1)
  }

  const handleFinish = async () => {
    if (!user?.id) return
    setSaving(true)
    setError(null)
    const { error: err } = await updateOnboarding(user.id, {
      completed: true,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      grade: grade || '2nde',
      levels: { ...levels },
      learningStyle: { ...learningStyle },
    })
    setSaving(false)
    if (err) {
      setError(err.message || 'Erreur lors de l’enregistrement.')
      return
    }
    navigate('/', { replace: true })
  }

  const setLevel = (subjectId, value) => {
    setLevels((prev) => ({ ...prev, [subjectId]: value }))
  }

  const toggleLearning = (id) => {
    setLearningStyle((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const progressPercent = (step / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f7f5ff] font-display text-text-primary antialiased">
      {/* Barre de progression type Duolingo */}
      <div className="fixed top-0 left-0 right-0 z-20 h-1.5 bg-white/80 backdrop-blur-sm">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent-purple transition-all duration-500 ease-out rounded-r-full"
          style={{ width: `${progressPercent}%` }}
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
        />
      </div>

      {/* Header compact */}
      <header className="relative z-10 pt-6 pb-2 px-6 flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center justify-center w-10 h-10 rounded-full text-text-muted hover:text-primary hover:bg-white/80 transition-colors"
            aria-label="Retour"
          >
            <span className="material-symbols-outlined text-[28px]">arrow_back</span>
          </button>
        ) : (
          <div className="w-10" />
        )}
        <Link to="/" className="flex shrink-0">
          <Logo size="sm" textClassName="flex" />
        </Link>
        <div className="w-10 text-right text-xs font-bold text-primary tabular-nums">
          {step}/{TOTAL_STEPS}
        </div>
      </header>

      <div className="flex-1 flex flex-col px-6 pb-8 pt-4 max-w-lg mx-auto w-full">
        {/* Étape 1 : Prénom + Nom */}
        {step === 1 && (
          <>
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center shadow-xl shadow-primary/25 mb-6">
                <span className="text-5xl" aria-hidden="true">👋</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight mb-2">
                Comment on t’appelle ?
              </h1>
              <p className="text-text-secondary text-base">
                On utilisera ton prénom pour personnaliser tes révisions.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="sr-only">Prénom</label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Prénom"
                  className="w-full rounded-2xl border-2 border-white bg-white py-4 px-5 text-lg text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all shadow-sm"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="lastName" className="sr-only">Nom</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Nom (optionnel)"
                  className="w-full rounded-2xl border-2 border-white bg-white py-4 px-5 text-lg text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          </>
        )}

        {/* Étape 2 : Classe */}
        {step === 2 && (
          <>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center shadow-xl shadow-primary/25 mb-6">
                <span className="text-5xl" aria-hidden="true">🎓</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight mb-2">
                En quelle classe es-tu ?
              </h1>
              <p className="text-text-secondary text-base">
                On adaptera les révisions au programme officiel de ta classe.
              </p>
            </div>
            <div className="space-y-3">
              {GRADES.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGrade(g.id)}
                  className={`w-full rounded-2xl border-2 p-5 flex items-center justify-center gap-3 transition-all ${
                    grade === g.id
                      ? 'border-primary bg-primary text-white shadow-lg shadow-primary/25'
                      : 'border-white bg-white text-text-primary hover:border-primary/30 shadow-sm'
                  }`}
                >
                  {grade === g.id && (
                    <span className="material-symbols-outlined text-[24px]" aria-hidden="true">check_circle</span>
                  )}
                  <span className="font-bold text-lg">{g.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Étape 3 : Niveaux par matière */}
        {step === 3 && (
          <>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center shadow-xl shadow-primary/25 mb-6">
                <span className="text-5xl" aria-hidden="true">📚</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight mb-2">
                Quel est ton niveau ?
              </h1>
              <p className="text-text-secondary text-base">
                Choisis pour chaque matière. On adaptera les explications.
              </p>
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-1">
              {SUBJECTS.map((subject) => (
                <div
                  key={subject.id}
                  className="rounded-2xl bg-white border-2 border-white shadow-sm p-4 hover:border-primary/20 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl" aria-hidden="true">{subject.emoji}</span>
                    <span className="font-bold text-text-primary">{subject.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setLevel(subject.id, level.value)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                          levels[subject.id] === level.value
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-slate-100 text-text-secondary hover:bg-slate-200'
                        }`}
                      >
                        {level.short}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Étape 4 : Préférences d'apprentissage */}
        {step === 4 && (
          <>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center shadow-xl shadow-primary/25 mb-6">
                <span className="text-5xl" aria-hidden="true">✨</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight mb-2">
                Comment tu apprends le mieux ?
              </h1>
              <p className="text-text-secondary text-base">
                Sélectionne tout ce qui te correspond. Plusieurs réponses possibles.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {LEARNING_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleLearning(option.id)}
                  className={`relative rounded-2xl border-2 p-5 flex flex-col items-center justify-center gap-2 text-center transition-all min-h-[120px] ${
                    learningStyle[option.id]
                      ? 'border-primary bg-primary text-white shadow-lg shadow-primary/25'
                      : 'border-white bg-white text-text-secondary hover:border-primary/30 hover:bg-white shadow-sm'
                  }`}
                >
                  {learningStyle[option.id] && (
                    <span className="absolute top-2 right-2 material-symbols-outlined text-[18px] text-white" aria-hidden="true">check_circle</span>
                  )}
                  <span className="text-3xl" aria-hidden="true">{option.emoji}</span>
                  <span className={`font-bold text-sm leading-tight ${learningStyle[option.id] ? 'text-white' : 'text-text-primary'}`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="mt-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Bouton principal fixe en bas */}
        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={handleNext}
            disabled={(step === 1 && !canNextStep1) || saving}
            className="w-full py-4 px-6 rounded-2xl bg-white border-2 border-primary text-primary font-bold text-lg shadow-lg hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-primary transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                Enregistrement...
              </>
            ) : step === TOTAL_STEPS ? (
              <>
                C’est parti !
                <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
              </>
            ) : (
              <>
                Continuer
                <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
