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
      <div className="flex h-full min-h-0 flex-col items-center justify-center bg-gradient-to-b from-sky-100 to-white p-6">
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
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#70ad42] font-display text-text-primary">
      <header className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex items-start justify-between gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
        <button
          type="button"
          onClick={() => navigate('/explorer')}
          className="pointer-events-auto flex min-h-11 items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold text-text-secondary shadow-md backdrop-blur transition-colors hover:text-primary"
          aria-label="Retour aux îles"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span className="hidden sm:inline">Îles</span>
        </button>
        <div className="pointer-events-auto max-w-[min(70vw,28rem)] rounded-2xl bg-white/90 px-4 py-2 text-right shadow-md backdrop-blur">
          <h1 className="truncate text-sm font-bold text-text-primary sm:text-base">{chapter.name}</h1>
          <p className="text-[11px] font-medium text-text-secondary sm:text-xs">Départ en bas, arrivée en haut</p>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <LevelMap
          key={`${subjectId}-${chapterId}`}
          nodes={chapter.nodes}
          onLevelClick={(node) => handleLevelClick(node)}
        />
      </div>
    </div>
  )
}
