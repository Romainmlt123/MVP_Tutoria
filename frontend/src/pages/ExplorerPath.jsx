import { useParams, useNavigate } from 'react-router-dom'
import { getChapter, GRADE_LABELS } from '../data/curriculum'
import { SUBJECT_LABELS } from '../utils/onboardingContext'
import useProfileStore from '../store/profileStore'
import LevelMap from '../components/LevelMap'

function buildExplorerContext(node, chapter, subjectId, grade) {
  const typeLabels = { lesson: 'Leçon', exercise: 'Exercice', boss: 'Boss' }
  const subjectLabel = SUBJECT_LABELS[subjectId] || subjectId
  const gradeLabel = GRADE_LABELS[grade] || grade
  const typeLabel = typeLabels[node.type] || node.type
  return `${typeLabel} : ${node.title}. Chapitre : ${chapter.name}. Matière : ${subjectLabel} ${gradeLabel}. ${node.promptContext}`
}

export default function ExplorerPath() {
  const { subjectId, chapterId } = useParams()
  const navigate = useNavigate()
  const { profile } = useProfileStore()

  const grade = profile?.settings?.onboarding?.grade || '2nde'
  const chapter = getChapter(subjectId, grade, chapterId)

  if (!chapter) {
    return (
      <div className="min-h-dvh min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-sky-100 to-white">
        <p className="text-text-secondary text-center mb-6">Chapitre introuvable.</p>
        <button
          type="button"
          onClick={() => navigate('/explorer')}
          className="px-6 py-3 rounded-xl bg-primary text-white font-medium"
        >
          Retour aux îles
        </button>
      </div>
    )
  }

  const handleLevelClick = (node) => {
    const context = buildExplorerContext(node, chapter, subjectId, grade)
    navigate('/chat', { state: { explorerContext: context } })
  }

  return (
    <div className="min-h-dvh min-h-screen flex flex-col bg-gradient-to-b from-amber-50 via-white to-primary/5 font-display text-text-primary">
      <header className="relative shrink-0 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-2 px-4 border-b border-border bg-white/80 backdrop-blur">
        <button
          type="button"
          onClick={() => navigate('/explorer')}
          className="flex items-center gap-2 text-text-secondary hover:text-primary mb-2"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Retour aux îles
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-text-primary">{chapter.name}</h1>
        <p className="text-text-secondary text-sm">
          Parcours sur grille • Tuiles avec cercles : touche un niveau pour ouvrir le chat
        </p>
      </header>

      <div className="relative flex-1 overflow-hidden px-3 sm:px-4 pb-6 pt-4 flex flex-col items-center min-h-0">
        <LevelMap
          key={`${subjectId}-${chapterId}`}
          nodes={chapter.nodes}
          onLevelClick={(node) => handleLevelClick(node)}
        />

        <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm text-text-secondary">
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-500 ring-2 ring-white shadow" />
            Leçon (bleu)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-green-500 ring-2 ring-white shadow" />
            Exercice (vert)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-red-500 ring-2 ring-white shadow" />
            Boss (rouge)
          </span>
          <span className="flex items-center gap-2 opacity-70">
            <span className="w-4 h-4 rounded-full bg-slate-400 ring-2 ring-white shadow" />
            Verrouillé (gris)
          </span>
        </div>
      </div>
    </div>
  )
}
