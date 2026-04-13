import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCurriculum, EXPLORER_SUBJECTS, GRADE_LABELS } from '../data/curriculum'
import useProfileStore from '../store/profileStore'
import { SUBJECT_LABELS } from '../utils/onboardingContext'

const MAP_IMAGES = {
  maths: '/images/carte-mathématiques.jpg',
}

const MATHS_CITY_POINTS = [
  { chapterId: 'nombres-calculs', x: 31, y: 18 },
  { chapterId: 'geometrie', x: 47, y: 18 },
  { chapterId: 'fonctions', x: 63, y: 18 },
  { chapterId: 'statistiques-probabilites', x: 79, y: 18 },
  { chapterId: 'algorithmique', x: 44, y: 31 },
  { chapterId: 'vocabulaire-ensembliste', x: 66, y: 31 },
]

export default function ExplorerMap() {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const { profile } = useProfileStore()

  const grade = profile?.settings?.onboarding?.grade || '2nde'
  const data = getCurriculum(subjectId, grade)
  const subjectInfo = EXPLORER_SUBJECTS.find((s) => s.id === subjectId)
  const subjectLabel = SUBJECT_LABELS[subjectId] || subjectInfo?.label || subjectId

  if (!data?.chapters?.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-sky-100 to-white">
        <p className="text-text-secondary text-center mb-6">
          Le programme {subjectLabel} pour {GRADE_LABELS[grade] || grade} n&apos;est pas encore disponible.
        </p>
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

  const hasMapImage = MAP_IMAGES[subjectId]
  const [hoveredChapterId, setHoveredChapterId] = useState(null)

  const points = useMemo(() => {
    if (subjectId !== 'maths') return []
    return MATHS_CITY_POINTS
      .map((p) => ({
        ...p,
        chapter: data.chapters.find((c) => c.id === p.chapterId),
      }))
      .filter((p) => p.chapter)
  }, [subjectId, data])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-100 to-white font-display text-text-primary">
      <header className="shrink-0 pt-4 pb-2 px-4">
        <button
          type="button"
          onClick={() => navigate('/explorer')}
          className="flex items-center gap-2 text-text-secondary hover:text-primary mb-2"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Retour
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-text-primary">
          Carte {subjectLabel}
        </h1>
        <p className="text-text-secondary text-sm">
          {GRADE_LABELS[grade] || grade} • Choisis une ville (chapitre)
        </p>
      </header>

      <div className="flex-1 relative overflow-auto px-4 pb-6">
        {hasMapImage ? (
          <div className="relative mx-auto w-full max-w-5xl aspect-square">
            <img
              src={MAP_IMAGES[subjectId]}
              alt={`Carte ${subjectLabel}`}
              className="w-full h-full object-contain"
            />
            {points.map((point) => {
              const isHovered = hoveredChapterId === point.chapter.id
              return (
                <button
                  key={point.chapter.id}
                  type="button"
                  onMouseEnter={() => setHoveredChapterId(point.chapter.id)}
                  onMouseLeave={() => setHoveredChapterId(null)}
                  onFocus={() => setHoveredChapterId(point.chapter.id)}
                  onBlur={() => setHoveredChapterId(null)}
                  onClick={() => navigate(`/explorer/${subjectId}/chapter/${point.chapter.id}`)}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  aria-label={`Ouvrir ${point.chapter.name}`}
                >
                  <span className={`block w-5 h-5 rounded-full border-2 border-primary shadow-md transition-all ${isHovered ? 'scale-125 bg-primary' : 'bg-white'}`} />
                  {isHovered && (
                    <span className="absolute left-1/2 -translate-x-1/2 -top-11 whitespace-nowrap px-3 py-1.5 rounded-lg bg-black/85 text-white text-xs font-medium">
                      {point.chapter.name}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-white to-accent-purple/10">
            <p className="text-text-secondary">Carte indisponible pour cette matière.</p>
          </div>
        )}
      </div>
    </div>
  )
}
