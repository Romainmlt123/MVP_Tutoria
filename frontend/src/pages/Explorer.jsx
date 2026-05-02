import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { EXPLORER_SUBJECTS, getDefaultChapterId } from '../data/curriculum'
import useProfileStore from '../store/profileStore'

const ISLAND_IMAGES = {
  maths: '/images/ile_math.png',
}

export default function Explorer() {
  const navigate = useNavigate()
  const grade = useProfileStore((s) => s.profile?.settings?.onboarding?.grade) || '2nde'
  const [index, setIndex] = useState(0)
  const subject = EXPLORER_SUBJECTS[index]

  const handlePrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : EXPLORER_SUBJECTS.length - 1))
  }, [])

  const handleNext = useCallback(() => {
    setIndex((i) => (i < EXPLORER_SUBJECTS.length - 1 ? i + 1 : 0))
  }, [])

  const handleExplore = () => {
    if (!subject.hasCurriculum) return
    const chapterId = getDefaultChapterId(subject.id, grade)
    if (chapterId) navigate(`/explorer/${subject.id}/chapter/${chapterId}`)
  }

  const touchStartXRef = useRef(0)
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartXRef.current
    if (dx > 50) handlePrev()
    else if (dx < -50) handleNext()
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] font-display text-text-primary touch-pan-y lg:pb-0">
      <div
        className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slider / Carousel */}
        <div className="relative flex w-full max-w-3xl flex-col items-center overflow-visible">
          <div className="mb-10 rounded-full bg-red-500 px-10 py-4 text-center text-2xl font-extrabold tracking-wide text-white shadow-sm sm:text-3xl">
            {subject.label}
          </div>

          {/* Flèches */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-0 top-1/2 z-10 flex h-12 w-12 -translate-x-2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300 bg-slate-200/90 text-white shadow-sm transition-colors hover:bg-slate-300 sm:h-14 sm:w-14"
            aria-label="Matière précédente"
          >
            <span className="material-symbols-outlined text-[32px]">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-0 top-1/2 z-10 flex h-12 w-12 translate-x-2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300 bg-slate-200/90 text-white shadow-sm transition-colors hover:bg-slate-300 sm:h-14 sm:w-14"
            aria-label="Matière suivante"
          >
            <span className="material-symbols-outlined text-[32px]">chevron_right</span>
          </button>

          <button
            type="button"
            onClick={handleExplore}
            disabled={!subject.hasCurriculum}
            className="relative w-full max-w-[36rem] cursor-pointer overflow-visible disabled:cursor-not-allowed disabled:opacity-70"
            aria-label={`Ouvrir le parcours ${subject.label}`}
          >
            {ISLAND_IMAGES[subject.id] ? (
              <img
                src={ISLAND_IMAGES[subject.id]}
                alt={`Île ${subject.label}`}
                className="block h-auto w-full select-none object-contain"
                draggable={false}
              />
            ) : (
              <div className="flex aspect-square w-full flex-col items-center justify-center rounded-[2rem] bg-gradient-to-br from-primary/20 to-accent-purple/20">
                <span className="mb-2 text-3xl" aria-hidden="true">
                  {subject.emoji}
                </span>
                <span className="text-2xl font-bold text-text-primary">{subject.label}</span>
              </div>
            )}
          </button>

          {/* Indicateurs */}
          <div className="flex justify-center gap-2 mt-4">
            {EXPLORER_SUBJECTS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === index ? 'bg-primary w-6' : 'bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Aller à ${EXPLORER_SUBJECTS[i].label}`}
              />
            ))}
          </div>
        </div>

        <p className="mt-5 text-sm text-text-secondary">
          {subject.hasCurriculum ? 'Fais glisser pour changer de matière' : 'Matière disponible bientôt'}
        </p>
      </div>
    </div>
  )
}
