import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import RadarChart from '../components/RadarChart'
import { user, analyticsKPIs, reviewItems, radarSubjects, monthlyXP } from '../data/mockData'
import { progressColors } from '../utils/colors'
import { smoothPath, valuesToPoints } from '../utils/chart'

const CHART_W = 478
const CHART_H = 150
const DAY_LABELS = ['01', '05', '10', '15', '20', '25', '30']

export default function Analytics() {
  const points = valuesToPoints(monthlyXP, CHART_W, CHART_H, 5)
  const linePath = smoothPath(points)
  const areaPath = `${linePath} L${CHART_W},${CHART_H} L0,${CHART_H} Z`

  return (
    <div className="h-full overflow-y-auto">
      <header className="p-8 pb-0">
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">Bon retour, {user.shortName}</h2>
            <p className="text-text-secondary text-base">Voici votre progression ce mois-ci.</p>
          </div>
          <div className="flex items-center gap-4">
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
          {analyticsKPIs.map((kpi) => (
            <StatCard key={kpi.label} {...kpi} />
          ))}
        </div>
      </header>

      <div className="px-8 pb-8 flex flex-col xl:flex-row gap-6">
        <div className="flex flex-col gap-6 flex-1">
          {/* Graphique mensuel */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-text-primary">Progression du mois</h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-3xl font-bold text-text-primary tracking-tight">1 240 XP</p>
                  <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-1 rounded-full border border-emerald-200">+15% vs Jan.</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-medium">Semaine</button>
                <button className="px-3 py-1 rounded-lg bg-transparent text-text-secondary text-xs font-medium hover:text-primary hover:bg-primary/5 transition">Mois</button>
              </div>
            </div>
            <div className="w-full h-[280px] relative">
              <svg
                className="w-full h-full"
                viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                preserveAspectRatio="none"
                fill="none"
                role="img"
                aria-label="Graphique de progression mensuelle en XP"
              >
                <defs>
                  <linearGradient id="chartGrad" x1="236" y1="0" x2="236" y2="150" gradientUnits="userSpaceOnUse">
                    <stop stopColor="var(--color-primary)" stopOpacity="0.2" />
                    <stop offset="1" stopColor="var(--color-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1={CHART_H - 1} x2={CHART_W} y2={CHART_H - 1} stroke="var(--color-border)" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="0" y1={CHART_H * 0.67} x2={CHART_W} y2={CHART_H * 0.67} stroke="var(--color-border)" strokeDasharray="4 4" strokeWidth="1" opacity="0.5" />
                <line x1="0" y1={CHART_H * 0.33} x2={CHART_W} y2={CHART_H * 0.33} stroke="var(--color-border)" strokeDasharray="4 4" strokeWidth="1" opacity="0.5" />
                <path d={areaPath} fill="url(#chartGrad)" />
                <path d={linePath} stroke="var(--color-primary)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              </svg>
              <div className="flex justify-between mt-2 px-2 text-xs text-text-muted font-medium font-mono">
                {DAY_LABELS.map(d => <span key={d}>{d}</span>)}
              </div>
            </div>
          </div>

          {/* Notions à réviser */}
          <section className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-text-primary">Notions à réviser</h3>
              <Link to="/flashcards" className="text-primary text-sm font-semibold hover:text-primary-dark transition">Voir tout</Link>
            </div>
            <div className="flex flex-col gap-4">
              {reviewItems.map((item) => {
                const c = progressColors[item.color] || progressColors.orange
                return (
                  <div key={item.name} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-slate-50 border border-border hover:border-primary/20 hover:shadow-sm transition group cursor-pointer">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`h-10 w-10 rounded-lg ${c.bg} flex items-center justify-center ${c.text} shrink-0`} aria-hidden="true">
                        <span className="material-symbols-outlined">{item.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-text-primary font-semibold">{item.name}</h4>
                        <p className="text-text-muted text-xs uppercase tracking-wider font-bold">{item.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-1/3">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${item.name} : ${item.progress}%`}>
                        <div className={`h-full ${c.bar} rounded-full`} style={{ width: `${item.progress}%` }} />
                      </div>
                      <span className={`${c.badge} font-bold text-sm w-12 text-right`}>{item.progress}%</span>
                    </div>
                    <div className="hidden sm:block">
                      <button className="h-8 w-8 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted hover:text-white hover:bg-primary hover:border-primary transition" aria-label={`Ouvrir ${item.name}`}>
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward_ios</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        {/* Colonne droite */}
        <div className="flex flex-col gap-6 xl:w-[360px] shrink-0">
          <RadarChart subjects={radarSubjects} />
          <div className="bg-gradient-to-br from-primary to-accent-purple rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-20" aria-hidden="true">
              <span className="material-symbols-outlined text-[150px]">psychology</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3 opacity-90">
                <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
                <span className="text-xs font-bold uppercase tracking-wider">Suggestion IA</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Réviser les équations ?</h4>
              <p className="text-sm opacity-90 mb-4 font-light">Votre précision baisse en soirée. Essayez une session rapide de 5 min maintenant.</p>
              <Link to="/flashcards" className="block w-full py-3 bg-white text-primary font-bold rounded-lg hover:bg-white/90 transition shadow-sm text-center">
                Lancer une session de 5 min
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
