import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { EXPLORER_SUBJECTS } from '../data/curriculum'

const ISLAND_IMAGES = {
  maths: '/images/ile-mathematique.png',
}

export default function Explorer() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const subject = EXPLORER_SUBJECTS[index]

  const handlePrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : EXPLORER_SUBJECTS.length - 1))
  }, [])

  const handleNext = useCallback(() => {
    setIndex((i) => (i < EXPLORER_SUBJECTS.length - 1 ? i + 1 : 0))
  }, [])

  const handleExplore = () => {
    if (subject.hasCurriculum) {
      navigate(`/explorer/${subject.id}`)
    }
  }

  let touchStartX = 0
  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX
  }
  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX
    if (dx > 50) handlePrev()
    else if (dx < -50) handleNext()
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-sky-100 via-white to-primary/5 font-display text-text-primary overflow-hidden">
      <header className="shrink-0 pt-4 pb-2 px-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
          Explorer
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Choisis une matière pour découvrir ton parcours
        </p>
      </header>

      <div
        className="flex-1 flex flex-col items-center justify-center px-4 py-6 min-h-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slider / Carousel */}
        <div className="relative w-full max-w-md overflow-hidden">
          {/* Flèches */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-primary hover:bg-white transition-colors -translate-x-2"
            aria-label="Matière précédente"
          >
            <span className="material-symbols-outlined text-[28px]">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-primary hover:bg-white transition-colors translate-x-2"
            aria-label="Matière suivante"
          >
            <span className="material-symbols-outlined text-[28px]">chevron_right</span>
          </button>

          {/* Île */}
          <div className="rounded-3xl overflow-hidden shadow-2xl border-2 border-white/80 bg-white">
            <div className="aspect-[4/3] relative">
              {ISLAND_IMAGES[subject.id] ? (
                <img
                  src={ISLAND_IMAGES[subject.id]}
                  alt={`Île ${subject.label}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-accent-purple/20">
                  <span className="text-3xl mb-2" aria-hidden="true">{subject.emoji}</span>
                  <span className="text-2xl font-bold text-text-primary">{subject.label}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-xl font-bold text-white drop-shadow-lg">{subject.label}</h2>
                <p className="text-white/90 text-sm">
                  {subject.hasCurriculum ? 'Clique pour explorer la carte' : 'Bientôt disponible'}
                </p>
              </div>
            </div>
          </div>

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

        {/* Bouton Explorer */}
        <button
          type="button"
          onClick={handleExplore}
          disabled={!subject.hasCurriculum}
          className="mt-8 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent-purple text-white font-bold text-lg shadow-lg shadow-primary/30 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
        >
          <span className="material-symbols-outlined text-[24px]">explore</span>
          {subject.hasCurriculum ? 'Explorer la carte' : 'Bientôt disponible'}
        </button>
      </div>
    </div>
  )
}
