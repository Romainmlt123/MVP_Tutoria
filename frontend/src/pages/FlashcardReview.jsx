import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useFlashcardStore from '../store/flashcardStore'

export default function FlashcardReview() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const { fetchCards, recordReview, fetchStats } = useFlashcardStore()
  const deckIds = location.state?.deckIds ?? []
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [index, setIndex] = useState(0)
  const [showBack, setShowBack] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(null)
  const [shuffledOrder, setShuffledOrder] = useState([])
  const [results, setResults] = useState({ correct: 0, incorrect: 0 })
  const [done, setDone] = useState(false)

  const currentCard = useMemo(() => cards[index] ?? null, [cards, index])
  const total = cards.length
  const isQcm = useMemo(() => {
    const c = currentCard?.choices
    return Array.isArray(c) && c.length === 4
  }, [currentCard])
  const progress = total > 0 ? Math.round(((index + (showBack || showExplanation ? 1 : 0)) / total) * 100) : 0

  useEffect(() => {
    if (currentCard && isQcm) {
      setShuffledOrder(shuffle([0, 1, 2, 3]))
      setShowExplanation(false)
      setSelectedChoiceIndex(null)
    }
  }, [currentCard?.id, isQcm])

  useEffect(() => {
    if (!deckIds.length || !user?.id) {
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      const allCards = []
      for (const deckId of deckIds) {
        const list = await fetchCards(deckId)
        if (!cancelled && list?.length) allCards.push(...list.map((c) => ({ ...c, deckId })))
      }
      if (!cancelled) {
        setCards(shuffle([...allCards]))
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [deckIds.join(','), user?.id])

  const handleCorrect = async () => {
    if (!currentCard || !user?.id) return
    await recordReview(user.id, currentCard.id, true)
    setResults((r) => ({ ...r, correct: r.correct + 1 }))
    next()
  }

  const handleIncorrect = async () => {
    if (!currentCard || !user?.id) return
    await recordReview(user.id, currentCard.id, false)
    setResults((r) => ({ ...r, incorrect: r.incorrect + 1 }))
    next()
  }

  const handleChoiceSelect = async (displayIndex) => {
    if (!currentCard || selectedChoiceIndex !== null) return
    const originalIndex = shuffledOrder[displayIndex]
    const correct = originalIndex === currentCard.correct_index
    setSelectedChoiceIndex(displayIndex)
    if (correct) {
      if (user?.id) await recordReview(user.id, currentCard.id, true)
      setResults((r) => ({ ...r, correct: r.correct + 1 }))
      setTimeout(() => next(), 600)
    } else {
      setShowExplanation(true)
      if (user?.id) await recordReview(user.id, currentCard.id, false)
      setResults((r) => ({ ...r, incorrect: r.incorrect + 1 }))
    }
  }

  const next = () => {
    setShowBack(false)
    setShowExplanation(false)
    setSelectedChoiceIndex(null)
    if (index + 1 >= total) {
      setDone(true)
      fetchStats(user?.id)
    } else {
      setIndex((i) => i + 1)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">progress_activity</span>
        <p className="text-text-secondary">Chargement des cartes...</p>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="rounded-2xl border border-border bg-surface p-8 max-w-md text-center">
          <span className="material-symbols-outlined text-4xl text-text-muted mb-4 block">style</span>
          <h2 className="text-xl font-bold text-text-primary mb-2">Aucune carte à réviser</h2>
          <p className="text-text-secondary mb-6">Ajoute des cartes dans tes dossiers pour lancer une révision.</p>
          <Link to="/flashcards" className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-5 py-2.5 font-semibold">
            <span className="material-symbols-outlined">arrow_back</span>
            Bibliothèque
          </Link>
        </div>
      </div>
    )
  }

  if (done) {
    const { correct, incorrect } = results
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 bg-gradient-to-b from-background via-background to-primary/[0.03]">
        <div className="rounded-3xl border border-border bg-surface shadow-xl shadow-primary/5 p-8 max-w-md w-full text-center ring-1 ring-black/5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent-purple/20 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2 font-[family-name:var(--font-family-display)]">Révision terminée</h2>
          <p className="text-text-secondary mb-6">{total} carte(s) révisée(s)</p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 p-5">
              <p className="text-3xl font-bold text-emerald-600">{correct}</p>
              <p className="text-sm font-medium text-emerald-700">Correct</p>
            </div>
            <div className="rounded-2xl bg-red-50 border-2 border-red-200 p-5">
              <p className="text-3xl font-bold text-red-600">{incorrect}</p>
              <p className="text-sm font-medium text-red-700">Incorrect</p>
            </div>
          </div>
          <p className="text-lg font-semibold text-text-primary mb-6">Précision : {pct}%</p>
          <Link
            to="/flashcards"
            className="inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-primary to-accent-purple text-white py-3.5 font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-shadow"
          >
            <span className="material-symbols-outlined">home</span>
            Retour à la bibliothèque
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto px-4 py-8 bg-gradient-to-b from-background via-background to-primary/[0.03]">
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/flashcards"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Quitter
        </Link>
        <span className="rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-semibold tabular-nums">
          {index + 1} <span className="text-text-muted font-normal">/</span> {total}
        </span>
      </div>
      <div className="flex-1 flex flex-col justify-center -mx-1">
        <div
          className="rounded-3xl border border-border bg-surface shadow-xl shadow-primary/5 overflow-hidden min-h-[300px] flex flex-col ring-1 ring-black/5"
          role="region"
          aria-label="Carte de révision"
        >
          <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
            {isQcm ? (
              <>
                {!showExplanation ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-4 w-fit">
                      <span className="material-symbols-outlined text-[14px]">help</span>
                      Question
                    </span>
                    <p className="text-xl md:text-2xl font-semibold text-text-primary whitespace-pre-wrap mb-8 leading-snug font-[family-name:var(--font-family-display)]">
                      {currentCard?.front || '—'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(shuffledOrder.length === 4 ? shuffledOrder : [0, 1, 2, 3]).map((origIdx, displayIdx) => {
                        const choice = currentCard?.choices?.[origIdx] ?? ''
                        const isCorrect = origIdx === currentCard?.correct_index
                        const isSelected = selectedChoiceIndex === displayIdx
                        const isDisabled = selectedChoiceIndex !== null
                        return (
                          <button
                            key={displayIdx}
                            type="button"
                            onClick={() => handleChoiceSelect(displayIdx)}
                            disabled={isDisabled}
                            className={`text-left rounded-2xl border-2 py-4 px-5 font-medium transition-all duration-200 flex items-center gap-3 ${
                              isDisabled
                                ? isSelected && isCorrect
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                                  : isSelected && !isCorrect
                                    ? 'border-red-400 bg-red-50 text-red-700 shadow-sm'
                                    : isCorrect
                                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                      : 'border-border bg-slate-50/80 text-text-muted'
                                : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5 hover:shadow-md active:scale-[0.99] text-text-primary'
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined shrink-0 text-[22px] ${
                                isDisabled && isCorrect ? 'text-emerald-500' : isDisabled && isSelected && !isCorrect ? 'text-red-500' : ''
                              }`}
                              style={isDisabled && (isCorrect || (isSelected && !isCorrect)) ? { fontVariationSettings: "'FILL' 1" } : undefined}
                            >
                              {isDisabled && isCorrect ? 'check_circle' : isDisabled && isSelected && !isCorrect ? 'cancel' : 'radio_button_unchecked'}
                            </span>
                            <span className="break-words">{choice}</span>
                          </button>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-700 px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-4 w-fit">
                      <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                      Explication
                    </span>
                    <p className="text-lg md:text-xl font-medium text-text-primary whitespace-pre-wrap mb-8 leading-relaxed">
                      {currentCard?.back || '—'}
                    </p>
                    <button
                      type="button"
                      onClick={next}
                      className="self-start rounded-2xl bg-gradient-to-r from-primary to-accent-purple text-white px-6 py-3 font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]"
                    >
                      Continuer
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                {!showBack ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-4 w-fit">
                      Recto
                    </span>
                    <p className="text-xl md:text-2xl font-semibold text-text-primary whitespace-pre-wrap font-[family-name:var(--font-family-display)]">
                      {currentCard?.front || '—'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowBack(true)}
                      className="mt-8 self-start rounded-2xl bg-primary/10 text-primary px-5 py-2.5 font-semibold hover:bg-primary/20 transition-colors"
                    >
                      Voir la réponse
                    </button>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-4 w-fit">
                      Verso
                    </span>
                    <p className="text-xl md:text-2xl font-semibold text-text-primary whitespace-pre-wrap mb-8 font-[family-name:var(--font-family-display)]">
                      {currentCard?.back || '—'}
                    </p>
                    <p className="text-sm font-medium text-text-muted mb-4">Tu connaissais la réponse ?</p>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={handleIncorrect}
                        className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-red-200 bg-red-50 text-red-600 py-3.5 font-semibold hover:bg-red-100 transition-colors"
                      >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>close</span>
                        Incorrect
                      </button>
                      <button
                        type="button"
                        onClick={handleCorrect}
                        className="flex-1 flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 text-emerald-600 py-3.5 font-semibold hover:bg-emerald-100 transition-colors"
                      >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                        Correct
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8">
        <p className="text-xs font-medium text-text-muted mb-2">Progression</p>
        <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden" aria-hidden="true">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent-purple transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
