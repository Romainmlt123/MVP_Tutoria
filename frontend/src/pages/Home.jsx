import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import StreakWidget from '../components/StreakWidget'
import SubjectCard from '../components/SubjectCard'
import useAuthStore from '../store/authStore'
import useProfileStore from '../store/profileStore'
import useChatStore from '../store/chatStore'
import useFlashcardStore from '../store/flashcardStore'
import { quickAccessSubjects } from '../data/mockData'

const DAY_LABEL_SHORT = { Lun: 'L', Mar: 'M', Mer: 'Me', Jeu: 'J', Ven: 'V', Sam: 'S', Dim: 'D' }

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bonne après-midi'
  return 'Bonsoir'
}

const DEFAULT_STREAK_DAYS = [
  { label: 'L', done: false },
  { label: 'M', done: false },
  { label: 'Me', done: false },
  { label: 'J', done: false },
  { label: 'V', done: false },
  { label: 'S', done: false },
  { label: 'D', done: false },
]

export default function Home() {
  const { user } = useAuthStore()
  const { profile } = useProfileStore()
  const {
    conversations,
    conversationsLoading,
    fetchConversations,
  } = useChatStore()
  const {
    decks,
    stats,
    decksLoading,
    statsLoading,
    fetchDecks,
    fetchStats,
  } = useFlashcardStore()

  useEffect(() => {
    if (user?.id) {
      fetchConversations(user.id)
      fetchDecks(user.id)
      fetchStats(user.id)
    }
  }, [user?.id, fetchConversations, fetchDecks, fetchStats])

  const displayName =
    profile?.settings?.onboarding?.firstName?.trim() ||
    profile?.display_name?.split(' ')[0] ||
    profile?.display_name ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Toi'
  const greeting = getGreeting()
  const onboarding = profile?.settings?.onboarding
  const onboardingTip =
    onboarding?.learningStyle?.diagrams &&
    'Tu aimes les visuels : demande des graphiques pour mieux comprendre.'
  const onboardingTip2 =
    onboarding?.levels?.maths >= 4 &&
    !onboardingTip &&
    'Tu es à l\'aise en maths : n\'hésite pas à demander des défis.'
  const personalTip = onboardingTip || onboardingTip2
  const lastConversation = conversations?.[0]
  const totalCards = (decks ?? []).reduce((s, d) => s + (d.cardCount ?? 0), 0)
  const firstDeckWithCards = (decks ?? []).find((d) => (d.cardCount ?? 0) > 0)

  const streakDays =
    stats?.weeklyActivity?.map((d) => ({
      label: DAY_LABEL_SHORT[d.label] ?? d.label.slice(0, 1),
      done: (d.value ?? 0) > 0,
    })) ?? DEFAULT_STREAK_DAYS

  const quickAccess =
    decks?.length > 0
      ? decks.slice(0, 3).map((deck) => ({
          name: deck.name,
          subtitle: `${deck.cardCount ?? 0} carte${(deck.cardCount ?? 0) > 1 ? 's' : ''}`,
          icon: deck.icon ?? 'style',
          color: deck.color ?? 'blue',
          slug: deck.id,
          to: `/flashcards/deck/${deck.id}`,
        }))
      : quickAccessSubjects

  return (
    <div className="container mx-auto max-w-7xl px-6 py-8 lg:px-12">
      {/* En-tête */}
      <header className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-text-primary mb-2">
            {greeting},{' '}
            <span className="bg-gradient-to-r from-primary to-accent-purple bg-clip-text text-transparent">
              {displayName}
            </span>
          </h1>
          <p className="text-text-secondary text-lg font-light italic mb-2">
            Le succès est la somme de petits efforts répétés jour après jour.
          </p>
          {personalTip && (
            <p className="text-sm text-primary font-medium">
              {personalTip}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm"
            aria-label="Rechercher"
          >
            <span className="material-symbols-outlined" aria-hidden="true">search</span>
          </button>
        </div>
      </header>

      {/* Grille */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:grid-rows-[auto_auto]">
        {/* Carte principale : dernière conversation ou CTA */}
        <div className="relative overflow-hidden rounded-2xl lg:col-span-8 group min-h-[280px] flex flex-col md:flex-row bg-gradient-to-r from-primary via-[#7c6cf0] to-accent-purple text-white shadow-xl shadow-primary/20">
          <div className="relative z-10 flex flex-1 flex-col justify-center p-8">
            {conversationsLoading ? (
              <div className="flex items-center gap-2 text-white/80">
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                <span>Chargement...</span>
              </div>
            ) : lastConversation ? (
              <>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    Dernière conversation
                  </span>
                </div>
                <h2 className="mb-1 text-3xl font-bold">
                  {lastConversation.title || 'Conversation'}
                </h2>
                <p className="mb-6 max-w-md text-white/80">
                  Reprends là où tu en étais avec Tutor&apos;IA.
                </p>
                <div>
                  <Link
                    to="/chat"
                    state={{ openConversationId: lastConversation.id }}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg hover:bg-white/90 transition-transform active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">play_arrow</span>
                    Continuer
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    Tutor&apos;IA
                  </span>
                </div>
                <h2 className="mb-1 text-3xl font-bold">Démarrer une conversation</h2>
                <p className="mb-6 max-w-md text-white/80">
                  Pose tes questions en maths ou en sciences, demande un graphique ou utilise le mode vocal.
                </p>
                <div>
                  <Link
                    to="/chat"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg hover:bg-white/90 transition-transform active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">chat</span>
                    Aller au chat
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Décoration */}
          <div className="relative hidden w-1/3 items-center justify-center p-8 md:flex" aria-hidden="true">
            <div className="aspect-square w-32 rounded-full border-4 border-white/20 bg-white/10 p-4 backdrop-blur-sm shadow-2xl flex items-center justify-center relative">
              <span className="material-symbols-outlined text-6xl text-white/80">science</span>
              <div className="absolute inset-0 rounded-full border-t-4 border-white/40 animate-spin [animation-duration:3s]" />
            </div>
          </div>
          <div className="absolute top-[-50px] right-[-50px] w-40 h-40 rounded-full bg-white/10 blur-sm" aria-hidden="true" />
          <div className="absolute bottom-[-30px] left-[30%] w-24 h-24 rounded-full bg-white/10 blur-sm" aria-hidden="true" />
        </div>

        {/* Widget de série (flashcards) */}
        <StreakWidget days={streakDays} />

        {/* Accès rapide : decks ou matières par défaut */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-text-primary">Accès rapide</h3>
            <Link
              to={decks?.length ? '/flashcards' : '/chat'}
              className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1"
            >
              {decks?.length ? 'Voir les decks' : 'Voir tout'}{' '}
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
          {decksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl p-6 bg-surface border border-border animate-pulse h-[120px]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickAccess.map((subject) => (
                <SubjectCard key={subject.slug ?? subject.name} {...subject} />
              ))}
            </div>
          )}
        </section>

        {/* À réviser : flashcards */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all lg:col-span-4 flex flex-col h-full min-h-[260px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <span className="relative flex h-3 w-3" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
              </span>
              À réviser
            </h3>
            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              {statsLoading ? '…' : totalCards} carte{totalCards !== 1 ? 's' : ''}
            </span>
          </div>

          <Link
            to="/flashcards"
            className="relative flex-1 mt-2 group cursor-pointer block"
          >
            <div className="absolute top-4 left-4 right-4 bottom-0 rounded-2xl bg-slate-100 border border-border opacity-50 scale-90 origin-bottom transition-transform duration-300 group-hover:translate-y-2" aria-hidden="true" />
            <div className="absolute top-2 left-2 right-2 bottom-0 rounded-2xl bg-slate-50 border border-border opacity-80 scale-95 origin-bottom transition-transform duration-300 group-hover:translate-y-1" aria-hidden="true" />
            <div className="absolute inset-0 rounded-2xl bg-surface border border-border p-5 shadow-md flex flex-col justify-center items-center text-center transition-transform duration-300 group-hover:-translate-y-1">
              <div className="mb-3 rounded-full bg-primary/10 p-2 text-primary" aria-hidden="true">
                <span className="material-symbols-outlined">psychology_alt</span>
              </div>
              {firstDeckWithCards ? (
                <>
                  <h4 className="text-text-primary font-medium mb-2">
                    {firstDeckWithCards.name}
                  </h4>
                  <p className="text-xs text-text-muted uppercase tracking-wider font-bold">
                    {firstDeckWithCards.cardCount ?? 0} carte{(firstDeckWithCards.cardCount ?? 0) !== 1 ? 's' : ''} à réviser
                  </p>
                </>
              ) : (
                <>
                  <h4 className="text-text-primary font-medium mb-2">
                    Réviser tes flashcards
                  </h4>
                  <p className="text-xs text-text-muted uppercase tracking-wider font-bold">
                    {decks?.length ? 'Crée des cartes ou ouvre un deck' : 'Crée ton premier deck'}
                  </p>
                </>
              )}
              <div className="mt-4 w-full">
                <span className="block w-full rounded-lg bg-primary/5 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
                  {totalCards > 0 ? 'Voir les decks' : 'Aller aux flashcards'}
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
