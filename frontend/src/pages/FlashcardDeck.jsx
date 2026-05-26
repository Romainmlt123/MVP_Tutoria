import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useFlashcardStore from '../store/flashcardStore'
import { gradientCardColors } from '../utils/colors'

export default function FlashcardDeck() {
  const { deckId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    decks,
    cardsLoading,
    fetchCards,
    fetchDecks,
    getDeckById,
    getCardsForDeck,
    createCard,
    updateCard,
    deleteCard,
    deleteDeck,
    setError,
    clearError,
  } = useFlashcardStore()
  const deck = getDeckById(deckId)
  const deckCards = getCardsForDeck(deckId)
  const isGlobalDeck = deck?.user_id == null
  const [modalCardOpen, setModalCardOpen] = useState(false)
  const [editingCardId, setEditingCardId] = useState(null)
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [choices, setChoices] = useState(['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [menuDeckId, setMenuDeckId] = useState(null)
  const [menuCardId, setMenuCardId] = useState(null)

  useEffect(() => {
    if (user?.id) fetchDecks(user.id)
  }, [user?.id, fetchDecks])

  useEffect(() => {
    if (deckId) fetchCards(deckId)
  }, [deckId, fetchCards])

  const handleSaveCard = async (e) => {
    e.preventDefault()
    if (!deckId || (!front.trim() && !back.trim()) || saving) return
    const choiceStrings = choices.map((c) => (c || '').trim()).filter(Boolean)
    const useQcm = choiceStrings.length === 4
    setSaving(true)
    clearError()
    const payload = { front: front.trim(), back: back.trim() }
    if (useQcm) {
      payload.choices = choiceStrings
      payload.correct_index = correctIndex
    }
    if (editingCardId) {
      const { error } = await updateCard(editingCardId, deckId, payload)
      if (!error) {
        setModalCardOpen(false)
        setEditingCardId(null)
        resetCardForm()
      } else setError(error.message)
    } else {
      const card = await createCard(deckId, payload)
      if (card) {
        setModalCardOpen(false)
        resetCardForm()
      }
    }
    setSaving(false)
  }

  const resetCardForm = () => {
    setFront('')
    setBack('')
    setChoices(['', '', '', ''])
    setCorrectIndex(0)
  }

  const handleEditCard = (card) => {
    setEditingCardId(card.id)
    setFront(card.front ?? '')
    setBack(card.back ?? '')
    const c = card.choices
    setChoices(Array.isArray(c) && c.length >= 4 ? c.slice(0, 4) : ['', '', '', ''])
    const ci = card.correct_index
    setCorrectIndex(typeof ci === 'number' && ci >= 0 && ci <= 3 ? ci : 0)
    setModalCardOpen(true)
    setMenuCardId(null)
  }

  const handleDeleteCard = async (cardId) => {
    if (!cardId || !deckId) return
    await deleteCard(cardId, deckId)
    setMenuCardId(null)
  }

  const handleDeleteDeck = async () => {
    if (!deckId) return
    await deleteDeck(deckId)
    setMenuDeckId(null)
    navigate('/flashcards', { replace: true })
  }

  const openNewCard = () => {
    setEditingCardId(null)
    resetCardForm()
    setModalCardOpen(true)
  }

  const startReview = () => {
    if ((deckCards?.length ?? 0) === 0) return
    navigate('/flashcards/review', { state: { deckIds: [deckId] } })
  }

  if (!deck && decks.length > 0 && !decks.find((d) => d.id === deckId)) {
    return (
      <div className="p-4 text-center sm:p-8">
        <p className="text-text-secondary mb-4">Dossier introuvable.</p>
        <Link to="/flashcards" className="text-primary font-medium hover:underline">Retour à la bibliothèque</Link>
      </div>
    )
  }

  const c = deck ? gradientCardColors[deck.color] || gradientCardColors.blue : gradientCardColors.blue

  return (
    <div className="page-shell">
      <header className="shrink-0 border-b border-border bg-surface/50 px-4 py-4 sm:px-6 sm:py-6 md:px-10 md:pt-10">
        <nav className="mb-3 flex min-w-0 flex-wrap items-center gap-1 text-sm font-medium text-text-muted sm:mb-4 sm:gap-2" aria-label="Fil d'Ariane">
          <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <Link to="/flashcards" className="hover:text-primary transition-colors">Flashcards</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="truncate text-text-primary" aria-current="page">{deck?.name ?? '…'}</span>
        </nav>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-white ${deck ? c.bg : 'bg-slate-200'}`}>
              <span className="material-symbols-outlined text-[28px]">{deck?.icon ?? 'style'}</span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold text-text-primary sm:text-2xl md:text-3xl">{deck?.name ?? '…'}</h1>
                {isGlobalDeck && (
                  <span className="rounded-full bg-primary/15 text-primary px-2.5 py-0.5 text-xs font-medium">Global</span>
                )}
              </div>
              <p className="text-text-secondary text-sm">{deckCards?.length ?? 0} carte(s)</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!isGlobalDeck && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuDeckId(menuDeckId === deckId ? null : deckId)}
                  className="p-2 rounded-lg border border-border text-text-muted hover:text-primary hover:bg-primary/5 transition-colors"
                  aria-label="Options du dossier"
                >
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
                {menuDeckId === deckId && (
                  <div className="absolute right-0 top-full mt-1 py-1 bg-surface border border-border rounded-xl shadow-lg z-10 min-w-[160px]">
                    <button
                      type="button"
                      onClick={handleDeleteDeck}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Supprimer le dossier
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={startReview}
              disabled={(deckCards?.length ?? 0) === 0}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent-purple text-white px-5 py-2.5 font-semibold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined text-[20px]">play_circle</span>
              Réviser ce deck
            </button>
            {!isGlobalDeck && (
              <button
                type="button"
                onClick={openNewCard}
                className="flex items-center gap-2 rounded-lg bg-primary/10 text-primary border border-primary/20 px-5 py-2.5 font-semibold hover:bg-primary/20 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Ajouter une carte
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="page-scroll px-4 py-4 sm:px-6 md:px-10 md:py-6">
        {cardsLoading ? (
          <div className="flex items-center justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        ) : (deckCards?.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-4xl">style</span>
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Aucune carte</h2>
            <p className="text-text-secondary mb-6 max-w-sm">Ajoute des cartes (recto / verso) pour pouvoir réviser.</p>
            {!isGlobalDeck && (
              <button
                type="button"
                onClick={openNewCard}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent-purple text-white px-6 py-3 font-semibold"
              >
                <span className="material-symbols-outlined">add</span>
                Ajouter une carte
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deckCards.map((card) => (
              <div
                key={card.id}
                className="relative rounded-2xl border border-border bg-surface p-5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="relative">
                  {!isGlobalDeck && (
                    <>
                      <button
                        type="button"
                        onClick={() => setMenuCardId(menuCardId === card.id ? null : card.id)}
                        className="absolute top-0 right-0 p-1 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5"
                        aria-label="Options"
                      >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                      {menuCardId === card.id && (
                        <div className="absolute right-0 top-8 py-1 bg-surface border border-border rounded-xl shadow-lg z-10 min-w-[140px]">
                          <button
                            type="button"
                            onClick={() => handleEditCard(card)}
                            className="w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-slate-50 rounded-lg"
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCard(card.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  <p className="text-sm font-medium text-text-muted mb-1">{Array.isArray(card.choices) && card.choices.length === 4 ? 'Question (QCM)' : 'Recto'}</p>
                  <p className="text-text-primary font-medium mb-4 line-clamp-2">{card.front || '—'}</p>
                  <p className="text-sm font-medium text-text-muted mb-1">{Array.isArray(card.choices) && card.choices.length === 4 ? 'Explication si faux' : 'Verso'}</p>
                  <p className="text-text-secondary text-sm line-clamp-2">{card.back || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal carte (ajout / édition) */}
      {modalCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true">
          <div className="bg-surface rounded-2xl border border-border shadow-xl w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-accent-purple px-6 py-4 text-white">
              <h3 className="text-lg font-bold">{editingCardId ? 'Modifier la carte' : 'Nouvelle carte'}</h3>
              <p className="text-sm text-white/80">Question, 4 réponses et explication (QCM)</p>
            </div>
            <form onSubmit={handleSaveCard} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label htmlFor="card-front" className="block text-sm font-medium text-text-primary mb-1">Question</label>
                <textarea
                  id="card-front"
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  placeholder="Ex. Quelle est la formule de l'aire d'un cercle ?"
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">4 réponses (coche la bonne)</label>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      name="correct"
                      id={`correct-${i}`}
                      checked={correctIndex === i}
                      onChange={() => setCorrectIndex(i)}
                      className="rounded-full border-border text-primary focus:ring-primary"
                    />
                    <input
                      type="text"
                      value={choices[i] ?? ''}
                      onChange={(e) => setChoices((prev) => { const p = [...prev]; p[i] = e.target.value; return p })}
                      placeholder={`Réponse ${i + 1}`}
                      className="flex-1 rounded-lg border border-border bg-background py-2 px-3 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none text-sm"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label htmlFor="card-back" className="block text-sm font-medium text-text-primary mb-1">Explication (affichée si la réponse est fausse)</label>
                <textarea
                  id="card-back"
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="Ex. L'aire d'un cercle est π × r² où r est le rayon."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setModalCardOpen(false); setEditingCardId(null); resetCardForm(); }}
                  className="flex-1 py-2.5 rounded-xl border border-border text-text-primary font-medium hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent-purple text-white font-semibold shadow-lg shadow-primary/25 disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : editingCardId ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
