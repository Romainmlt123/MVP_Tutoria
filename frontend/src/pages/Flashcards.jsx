import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FlashcardSubject from '../components/FlashcardSubject'
import ProgressChart from '../components/ProgressChart'
import useAuthStore from '../store/authStore'
import useFlashcardStore from '../store/flashcardStore'
import { SEED_FLASHCARDS_TEST } from '../data/seedFlashcards'

export default function Flashcards() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    decks,
    stats,
    decksLoading,
    error: flashcardError,
    clearError: clearFlashcardError,
    fetchDecks,
    fetchStats,
    fetchCards,
    createDeck,
    createCard,
    DECK_COLORS,
    DECK_ICONS,
  } = useFlashcardStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('style')
  const [newColor, setNewColor] = useState('blue')
  const [creating, setCreating] = useState(false)
  const [generatingSeed, setGeneratingSeed] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchDecks(user.id)
      fetchStats(user.id)
    }
  }, [user?.id, fetchDecks, fetchStats])

  const handleCreateDeck = async (e) => {
    e.preventDefault()
    if (!user?.id || creating) return
    setCreating(true)
    clearFlashcardError()
    const name = newName.trim() || 'Nouveau dossier'
    const deck = await createDeck(user.id, { name, icon: newIcon, color: newColor })
    setCreating(false)
    if (deck) {
      setModalOpen(false)
      setNewName('')
      setNewIcon('style')
      setNewColor('blue')
      navigate(`/flashcards/deck/${deck.id}`)
    }
  }

  const openCreateModal = () => {
    clearFlashcardError()
    setNewName('')
    setNewIcon('style')
    setNewColor('blue')
    setModalOpen(true)
  }

  const handleStartDailyReview = () => {
    const deckIdsWithCards = decks.filter((d) => (d.cardCount ?? 0) > 0).map((d) => d.id)
    if (deckIdsWithCards.length === 0) return
    navigate('/flashcards/review', { state: { deckIds: deckIdsWithCards } })
  }

  const handleGenerateSeed = async () => {
    if (!user?.id || generatingSeed) return
    setGeneratingSeed(true)
    clearFlashcardError()
    const deck = await createDeck(user.id, { name: 'Culture générale', icon: 'menu_book', color: 'purple' })
    if (!deck) {
      setGeneratingSeed(false)
      return
    }
    let created = 0
    for (const card of SEED_FLASHCARDS_TEST) {
      const result = await createCard(deck.id, {
        front: card.front,
        back: card.back,
        choices: card.choices,
        correct_index: card.correct_index,
      })
      if (result) created++
      else break
    }
    await fetchCards(deck.id)
    await fetchDecks(user.id)
    setGeneratingSeed(false)
    if (created > 0) navigate(`/flashcards/deck/${deck.id}`)
  }

  const weeklyActivity = stats?.weeklyActivity ?? [
    { label: 'Dim', value: 0 },
    { label: 'Lun', value: 0 },
    { label: 'Mar', value: 0 },
    { label: 'Mer', value: 0 },
    { label: 'Jeu', value: 0 },
    { label: 'Ven', value: 0 },
    { label: 'Sam', value: 0 },
  ]

  return (
    <div className="page-shell">
      <header className="shrink-0 px-4 py-4 sm:px-6 sm:py-6 md:px-10 md:pt-10">
        <div className="flex flex-col gap-6">
          <nav className="flex min-w-0 flex-wrap items-center gap-1 text-sm font-medium text-text-muted sm:gap-2" aria-label="Fil d'Ariane">
            <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">chevron_right</span>
            <span className="text-text-primary" aria-current="page">Bibliothèque de Flashcards</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">Bibliothèque de Flashcards</h2>
              <p className="text-text-secondary text-base">Prêt à maîtriser tes matières aujourd&apos;hui ?</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleStartDailyReview}
                disabled={decks.length === 0 || decks.every((d) => (d.cardCount ?? 0) === 0)}
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent-purple text-white px-6 py-3 font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 group disabled:opacity-50 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined group-hover:animate-pulse" aria-hidden="true">play_circle</span>
                <span>Révision quotidienne</span>
              </button>
              <button
                type="button"
                onClick={handleGenerateSeed}
                disabled={generatingSeed}
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-primary/30 bg-primary/5 text-primary px-5 py-3 font-semibold hover:bg-primary/10 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {generatingSeed ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    <span>Génération… ({SEED_FLASHCARDS_TEST.length} cartes)</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    <span>Générer des cartes d&apos;exemple</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="page-scroll px-4 pb-8 sm:px-6 md:px-10 md:pb-10">
        {flashcardError && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
              {flashcardError}
              {flashcardError.includes('choices') || flashcardError.includes('column') ? ' Exécute la migration 003 (QCM) dans le SQL Editor Supabase.' : ''}
            </span>
            <button type="button" onClick={clearFlashcardError} className="p-1 rounded hover:bg-red-100" aria-label="Fermer">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )}
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-4">
            {decksLoading ? (
              <div className="col-span-full flex items-center justify-center py-12 text-text-muted">
                <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
              </div>
            ) : (
              decks.map((deck) => (
                <FlashcardSubject
                  key={deck.id}
                  to={`/flashcards/deck/${deck.id}`}
                  name={deck.name}
                  icon={deck.icon ?? 'style'}
                  cardCount={deck.cardCount ?? 0}
                  progress={0}
                  color={deck.color ?? 'blue'}
                  isGlobal={deck.user_id == null}
                />
              ))
            )}
            <button
              type="button"
              onClick={openCreateModal}
              className="flex flex-col items-center justify-center h-full min-h-[180px] rounded-2xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
              aria-label="Créer un nouveau dossier"
            >
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/10 transition-all" aria-hidden="true">
                <span className="material-symbols-outlined text-text-muted group-hover:text-primary">add</span>
              </div>
              <p className="text-sm font-medium text-text-muted group-hover:text-primary">Créer un nouveau dossier</p>
            </button>
          </div>

          <section className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-primary">Statistiques d&apos;apprentissage</h2>
              <Link to="/analytics" className="text-sm text-primary font-medium hover:text-primary-dark flex items-center gap-1">
                Voir le rapport complet <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <ProgressChart data={weeklyActivity} title="Activité (7 jours)" />
              <div className="flex flex-col gap-4">
                <div className="flex-1 rounded-2xl bg-surface border border-border p-5 flex items-center justify-between group hover:shadow-md transition-all shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-sm text-text-secondary font-medium mb-1">Série en cours</span>
                    <span className="text-2xl font-bold text-text-primary">{stats?.currentStreak ?? 0} Jours</span>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-accent-coral group-hover:scale-110 transition-transform" aria-hidden="true">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                  </div>
                </div>
                <div className="flex-1 rounded-2xl bg-surface border border-border p-5 flex items-center justify-between group hover:shadow-md transition-all shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-sm text-text-secondary font-medium mb-1">Total maîtrisé</span>
                    <span className="text-2xl font-bold text-text-primary">{(stats?.totalMastered ?? 0).toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform" aria-hidden="true">
                    <span className="material-symbols-outlined">workspace_premium</span>
                  </div>
                </div>
                <div className="flex-1 rounded-2xl bg-surface border border-border p-5 flex items-center justify-between group hover:shadow-md transition-all shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-sm text-text-secondary font-medium mb-1">Précision</span>
                    <span className="text-2xl font-bold text-text-primary">{stats?.accuracy ?? 0}%</span>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform" aria-hidden="true">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modal créer un dossier */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" aria-modal="true">
          <div className="bg-surface rounded-2xl border border-border shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-accent-purple px-6 py-4 text-white">
              <h3 className="text-lg font-bold">Nouveau dossier</h3>
              <p className="text-sm text-white/80">Crée un thème pour tes cartes (ex. Mathématiques)</p>
            </div>
            <form onSubmit={handleCreateDeck} className="p-6 space-y-4">
              {flashcardError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
                  <span>{flashcardError}</span>
                </div>
              )}
              <div>
                <label htmlFor="deck-name" className="block text-sm font-medium text-text-primary mb-1">Nom du dossier</label>
                <input
                  id="deck-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex. Mathématiques"
                  className="w-full rounded-xl border border-border bg-background py-2.5 px-4 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Icône</label>
                <div className="flex flex-wrap gap-2">
                  {DECK_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewIcon(icon)}
                      className={`p-2 rounded-lg border transition-colors ${newIcon === icon ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-muted hover:border-primary/50'}`}
                      aria-label={icon}
                    >
                      <span className="material-symbols-outlined text-[22px]">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Couleur</label>
                <div className="flex flex-wrap gap-2">
                  {DECK_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${newColor === color ? 'border-text-primary scale-110' : 'border-border hover:scale-105'}`}
                      style={{
                        backgroundColor: color === 'blue' ? '#3B82F6' : color === 'purple' ? '#8B5CF6' : color === 'green' ? '#10B981' : color === 'orange' ? '#F59E0B' : color === 'red' ? '#EF4444' : color === 'pink' ? '#EC4899' : '#14B8A6',
                      }}
                      aria-label={color}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-text-primary font-medium hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent-purple text-white font-semibold shadow-lg shadow-primary/25 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {creating ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
