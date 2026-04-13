import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getChapter, GRADE_LABELS } from '../data/curriculum'
import { SUBJECT_LABELS } from '../utils/onboardingContext'
import useProfileStore from '../store/profileStore'

const CHAPTER_BACKGROUNDS = {
  'nombres-calculs': '/images/ville-arithémtiques.png',
}

const NODE_COLORS = {
  lesson: { dot: 'bg-blue-500', label: 'Leçon' },
  exercise: { dot: 'bg-green-500', label: 'Exercice' },
  boss: { dot: 'bg-red-500', label: 'Boss' },
}

const DEFAULT_NODE_POINTS = [
  { x: 18, y: 60 },
  { x: 32, y: 51 },
  { x: 46, y: 62 },
  { x: 60, y: 53 },
  { x: 74, y: 64 },
  { x: 86, y: 56 },
]

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
  const [hoveredNode, setHoveredNode] = useState(null)

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

      <div className="relative flex-1 overflow-auto px-4 pb-6 pt-4">
        <div className="mx-auto w-full max-w-6xl">
          <div className="relative aspect-[4834/864]">
            {bgImage ? (
              <img src={bgImage} alt={`Ville ${chapter.name}`} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full rounded-xl bg-slate-100" />
            )}

            {chapter.nodes.map((node, i) => {
              const pos = DEFAULT_NODE_POINTS[i] || DEFAULT_NODE_POINTS[DEFAULT_NODE_POINTS.length - 1]
              const colors = NODE_COLORS[node.type] || NODE_COLORS.lesson
              const isHovered = hoveredNode === i
              return (
                <button
                  key={`${node.title}-${i}`}
                  type="button"
                  onMouseEnter={() => setHoveredNode(i)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onFocus={() => setHoveredNode(i)}
                  onBlur={() => setHoveredNode(null)}
                  onClick={() => handleNodeClick(node)}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  aria-label={`${colors.label} : ${node.title}`}
                >
                  <span className={`block w-6 h-6 rounded-full border-2 border-white shadow-md transition-transform ${colors.dot} ${isHovered ? 'scale-125' : ''}`} />
                  {isHovered && (
                    <span className="absolute left-1/2 -translate-x-1/2 -top-11 whitespace-nowrap px-3 py-1.5 rounded-lg bg-black/85 text-white text-xs font-medium">
                      {colors.label} • {node.title}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Légende */}
          <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
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
