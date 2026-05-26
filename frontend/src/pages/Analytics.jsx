import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import RadarChart from '../components/RadarChart'
import { supabase } from '../lib/supabase'
import useAuthStore from '../store/authStore'
import useProfileStore from '../store/profileStore'
import useFlashcardStore from '../store/flashcardStore'
import { radarSubjects } from '../data/mockData'
import { progressColors, gradientCardColors } from '../utils/colors'
import { smoothPath, valuesToPoints } from '../utils/chart'

const CHART_W = 478
const CHART_H = 150

export default function Analytics() {
  const { user } = useAuthStore()
  const { profile } = useProfileStore()
  const { stats, decks, statsLoading, decksLoading, fetchStats, fetchDecks } = useFlashcardStore()
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'toi'
  const [convCount, setConvCount] = useState(0)
  const [msgCount, setMsgCount] = useState(0)
  const [chatLoading, setChatLoading] = useState(true)

  useEffect(() => {
    if (!supabase || !user?.id) {
      setChatLoading(false)
      return
    }
    let cancelled = false
    async function fetchCounts() {
      const { count: c } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      if (cancelled) return
      setConvCount(c ?? 0)
      const { data: convs } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
      if (!convs?.length) {
        setMsgCount(0)
        setChatLoading(false)
        return
      }
      const { count: m } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', convs.map((x) => x.id))
      if (!cancelled) setMsgCount(m ?? 0)
      setChatLoading(false)
    }
    fetchCounts()
    return () => { cancelled = true }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      fetchStats(user.id)
      fetchDecks(user.id)
    }
  }, [user?.id, fetchStats, fetchDecks])

  const weeklyActivity = stats?.weeklyActivity ?? [
    { label: 'Dim', value: 0 },
    { label: 'Lun', value: 0 },
    { label: 'Mar', value: 0 },
    { label: 'Mer', value: 0 },
    { label: 'Jeu', value: 0 },
    { label: 'Ven', value: 0 },
    { label: 'Sam', value: 0 },
  ]
  const chartValues = weeklyActivity.map((d) => d.value)
  const points = valuesToPoints(chartValues, CHART_W, CHART_H, 5)
  const linePath = smoothPath(points)
  const areaPath = `${linePath} L${CHART_W},${CHART_H} L0,${CHART_H} Z`

  const totalReviews = stats?.totalReviews ?? 0
  const streak = stats?.currentStreak ?? 0
  const accuracy = stats?.accuracy ?? 0
  const mastered = stats?.totalMastered ?? 0

  const kpis = [
    { label: 'Conversations', value: chatLoading ? '…' : String(convCount), change: '', changeLabel: '', icon: 'chat_bubble', bgIcon: 'chat_bubble', color: 'primary', trend: 'up' },
    { label: 'Messages échangés', value: chatLoading ? '…' : String(msgCount), change: '', changeLabel: '', icon: 'mail', bgIcon: 'mail', color: 'purple', trend: 'up' },
    { label: 'Série en cours', value: statsLoading ? '…' : `${streak} jour${streak !== 1 ? 's' : ''}`, change: '', changeLabel: '', icon: 'local_fire_department', bgIcon: 'local_fire_department', color: 'red', trend: 'up' },
    { label: 'Précision flashcards', value: statsLoading ? '…' : `${accuracy}%`, change: '', changeLabel: '', icon: 'target', bgIcon: 'analytics', color: 'orange', trend: 'up' },
  ]

  return (
    <div className="page-scroll w-full max-w-full">
      <header className="page-padding pb-0">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">Bon retour, {displayName}</h2>
            <p className="text-text-secondary text-base">Voici ta progression ce mois-ci.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-sm text-text-primary hover:border-primary/30 transition shadow-sm" aria-label="Sélectionner la période">
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">calendar_today</span>
              <span>Fév. 2026</span>
            </button>
            <button className="p-2 rounded-full bg-surface border border-border text-text-secondary hover:text-primary transition relative shadow-sm" aria-label="Notifications">
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border-2 border-surface" aria-hidden="true" />
              <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi) => (
            <StatCard key={kpi.label} {...kpi} />
          ))}
        </div>
      </header>

      <div className="flex flex-col gap-6 px-4 pb-6 sm:px-6 sm:pb-8 lg:px-8 xl:flex-row">
        <div className="flex flex-col gap-6 flex-1">
          {/* Activité 7 jours (révisions flashcards) */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-text-primary">Activité (7 derniers jours)</h3>
                <p className="text-text-secondary text-sm mt-1">
                  {statsLoading ? '…' : `${totalReviews} révision${totalReviews !== 1 ? 's' : ''} au total · ${mastered} carte${mastered !== 1 ? 's' : ''} maîtrisée${mastered !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <div className="w-full h-[280px] relative">
              <svg
                className="w-full h-full"
                viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                preserveAspectRatio="xMidYMid meet"
                fill="none"
                role="img"
                aria-label="Révisions flashcards par jour"
              >
                <defs>
                  <linearGradient id="chartGradAnalytics" x1="236" y1="0" x2="236" y2="150" gradientUnits="userSpaceOnUse">
                    <stop stopColor="var(--color-primary)" stopOpacity="0.2" />
                    <stop offset="1" stopColor="var(--color-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1={CHART_H - 1} x2={CHART_W} y2={CHART_H - 1} stroke="var(--color-border)" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="0" y1={CHART_H * 0.67} x2={CHART_W} y2={CHART_H * 0.67} stroke="var(--color-border)" strokeDasharray="4 4" strokeWidth="1" opacity="0.5" />
                <line x1="0" y1={CHART_H * 0.33} x2={CHART_W} y2={CHART_H * 0.33} stroke="var(--color-border)" strokeDasharray="4 4" strokeWidth="1" opacity="0.5" />
                <path d={areaPath} fill="url(#chartGradAnalytics)" />
                <path d={linePath} stroke="var(--color-primary)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
              <div className="flex justify-between mt-2 px-2 text-xs text-text-muted font-medium">
                {weeklyActivity.map((d) => (
                  <span key={d.label}>{d.label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Tes dossiers flashcards */}
          <section className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text-primary">Tes dossiers flashcards</h3>
              <Link to="/flashcards" className="text-primary text-sm font-semibold hover:text-primary-dark transition">Voir tout</Link>
            </div>
            {decksLoading ? (
              <div className="flex items-center justify-center py-12 text-text-muted">
                <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
              </div>
            ) : decks.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-text-secondary mb-4">Aucun dossier pour l’instant.</p>
                <Link to="/flashcards" className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-4 py-2 font-semibold text-sm">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Créer un dossier
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {decks.map((deck) => {
                  const c = gradientCardColors[deck.color] || gradientCardColors.blue
                  const cardCount = deck.cardCount ?? 0
                  return (
                    <Link
                      key={deck.id}
                      to={`/flashcards/deck/${deck.id}`}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-slate-50 border border-border hover:border-primary/20 hover:shadow-sm transition group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`h-10 w-10 rounded-lg ${c.bg} flex items-center justify-center text-white shrink-0`} aria-hidden="true">
                          <span className="material-symbols-outlined">{deck.icon ?? 'style'}</span>
                        </div>
                        <div>
                          <h4 className="text-text-primary font-semibold group-hover:text-primary transition">{deck.name}</h4>
                          <p className="text-text-muted text-xs">
                            {cardCount} carte{cardCount !== 1 ? 's' : ''}
                            {deck.user_id == null && (
                              <span className="ml-2 rounded bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-medium">Global</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-text-secondary">
                          Réviser
                        </span>
                        <span className="h-8 w-8 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted group-hover:text-white group-hover:bg-primary group-hover:border-primary transition">
                          <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        {/* Colonne droite */}
        <div className="flex w-full min-w-0 shrink-0 flex-col gap-6 xl:w-[min(100%,360px)]">
          <RadarChart subjects={radarSubjects} />
          <div className="bg-gradient-to-br from-primary to-accent-purple rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-20" aria-hidden="true">
              <span className="material-symbols-outlined text-[150px]">psychology</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3 opacity-90">
                <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
                <span className="text-xs font-bold uppercase tracking-wider">Suggestion</span>
              </div>
              {weeklyActivity.length > 0 && weeklyActivity[weeklyActivity.length - 1].value === 0 && (decks?.length ?? 0) > 0 ? (
                <>
                  <h4 className="text-xl font-bold mb-2">Réviser aujourd&apos;hui ?</h4>
                  <p className="text-sm opacity-90 mb-4 font-light">Tu n&apos;as pas encore révisé. Une petite session de 5 min pour garder le rythme.</p>
                  <Link to="/flashcards" className="block w-full py-3 bg-white text-primary font-bold rounded-lg hover:bg-white/90 transition shadow-sm text-center">
                    Lancer une session
                  </Link>
                </>
              ) : totalReviews > 0 ? (
                <>
                  <h4 className="text-xl font-bold mb-2">Bien joué !</h4>
                  <p className="text-sm opacity-90 mb-4 font-light">Tu as révisé récemment. Continue comme ça pour renforcer ta mémoire.</p>
                  <Link to="/flashcards" className="block w-full py-3 bg-white text-primary font-bold rounded-lg hover:bg-white/90 transition shadow-sm text-center">
                    Réviser encore
                  </Link>
                </>
              ) : (
                <>
                  <h4 className="text-xl font-bold mb-2">Commence à réviser</h4>
                  <p className="text-sm opacity-90 mb-4 font-light">Utilise tes flashcards ou le deck global « Culture générale » pour démarrer.</p>
                  <Link to="/flashcards" className="block w-full py-3 bg-white text-primary font-bold rounded-lg hover:bg-white/90 transition shadow-sm text-center">
                    Aller aux flashcards
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
