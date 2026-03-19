import { useParams, useNavigate } from 'react-router-dom'
import { getCurriculum, EXPLORER_SUBJECTS, GRADE_LABELS } from '../data/curriculum'
import useProfileStore from '../store/profileStore'
import { SUBJECT_LABELS } from '../utils/onboardingContext'

const MAP_IMAGES = {
  maths: '/images/carte-mathématiques.jpg',
}

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

      <div className="flex-1 relative overflow-hidden">
        {hasMapImage ? (
          <div className="absolute inset-0">
            <img
              src={MAP_IMAGES[subjectId]}
              alt={`Carte ${subjectLabel}`}
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-white to-accent-purple/10" />
        )}

        {/* Villes (chapitres) en overlay */}
        <div className="relative h-full p-6 flex flex-wrap content-center justify-center gap-4">
          {data.chapters.map((chapter, i) => (
            <button
              key={chapter.id}
              type="button"
              onClick={() => navigate(`/explorer/${subjectId}/chapter/${chapter.id}`)}
              className="group relative px-6 py-4 rounded-2xl bg-white/95 backdrop-blur border-2 border-primary/30 shadow-lg hover:shadow-xl hover:border-primary hover:scale-105 transition-all text-left min-w-[180px]"
            >
              <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                {i + 1}
              </span>
              <span className="font-bold text-text-primary block">{chapter.name}</span>
              <span className="text-xs text-text-muted mt-1 block">
                {chapter.nodes.length} étapes
              </span>
              <span className="material-symbols-outlined absolute right-3 bottom-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                arrow_forward
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
