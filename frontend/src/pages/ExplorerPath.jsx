import { useParams, useNavigate } from 'react-router-dom'
import { getChapter, getCurriculum, GRADE_LABELS } from '../data/curriculum'
import { SUBJECT_LABELS } from '../utils/onboardingContext'
import useProfileStore from '../store/profileStore'

const CHAPTER_BACKGROUNDS = {
  'nombres-calculs': '/images/ville-arithémtiques.png',
}

const NODE_COLORS = {
  lesson: { bg: 'bg-blue-500', ring: 'ring-blue-400', label: 'Leçon', icon: 'menu_book' },
  exercise: { bg: 'bg-green-500', ring: 'ring-green-400', label: 'Exercice', icon: 'fitness_center' },
  boss: { bg: 'bg-red-500', ring: 'ring-red-400', label: 'Boss', icon: 'military_tech' },
}

function buildExplorerContext(node, chapter, subjectId, grade) {
  const subjectLabel = SUBJECT_LABELS[subjectId] || subjectId
  const gradeLabel = GRADE_LABELS[grade] || grade
  const typeLabel = NODE_COLORS[node.type]?.label || node.type
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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-sky-100 to-white">
        <p className="text-text-secondary text-center mb-6">Chapitre introuvable.</p>
        <button
          type="button"
          onClick={() => navigate(`/explorer/${subjectId}`)}
          className="px-6 py-3 rounded-xl bg-primary text-white font-medium"
        >
          Retour à la carte
        </button>
      </div>
    )
  }

  const handleNodeClick = (node) => {
    const context = buildExplorerContext(node, chapter, subjectId, grade)
    navigate('/chat', { state: { explorerContext: context } })
  }

  const bgImage = CHAPTER_BACKGROUNDS[chapterId]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 via-white to-primary/5 font-display text-text-primary relative">
      {bgImage && (
        <div className="fixed inset-0 opacity-20 pointer-events-none">
          <img src={bgImage} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <header className="relative shrink-0 pt-4 pb-2 px-4 border-b border-border bg-white/80 backdrop-blur">
        <button
          type="button"
          onClick={() => navigate(`/explorer/${subjectId}`)}
          className="flex items-center gap-2 text-text-secondary hover:text-primary mb-2"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Retour à la carte
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-text-primary">{chapter.name}</h1>
        <p className="text-text-secondary text-sm">
          Parcours type Mario • Clique sur une étape pour lancer le chat
        </p>
      </header>

      <div className="relative flex-1 overflow-auto p-6">
        {/* Parcours en zigzag / linéaire */}
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col gap-6">
            {chapter.nodes.map((node, i) => {
              const colors = NODE_COLORS[node.type] || NODE_COLORS.lesson
              const isLeft = i % 2 === 0
              return (
                <div key={i} className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}>
                  <button
                    type="button"
                    onClick={() => handleNodeClick(node)}
                    className={`group flex items-center gap-4 p-4 rounded-2xl ${colors.bg} text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all ring-4 ${colors.ring} ring-opacity-50 min-w-[240px] max-w-[320px]`}
                  >
                    <span className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[28px]">{colors.icon}</span>
                    </span>
                    <div className="text-left flex-1 min-w-0">
                      <span className="text-xs font-medium opacity-90 block">{colors.label}</span>
                      <span className="font-bold truncate block">{node.title}</span>
                    </div>
                    <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity">
                      play_arrow
                    </span>
                  </button>
                </div>
              )
            })}
          </div>

          {/* Légende */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-blue-500" />
              Leçon
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-500" />
              Exercice
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-500" />
              Boss (évaluation)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
