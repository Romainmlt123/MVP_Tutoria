import { Link } from 'react-router-dom'
import FlashcardSubject from '../components/FlashcardSubject'
import ProgressChart from '../components/ProgressChart'
import { flashcardSubjects, flashcardStats, weeklyActivity } from '../data/mockData'

export default function Flashcards() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex-none px-6 py-6 md:px-10 md:pt-10">
        <div className="flex flex-col gap-6">
          <nav className="flex items-center gap-2 text-sm font-medium text-text-muted" aria-label="Fil d'Ariane">
            <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">chevron_right</span>
            <span className="text-text-primary" aria-current="page">Bibliothèque de Flashcards</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">Bibliothèque de Flashcards</h2>
              <p className="text-text-secondary text-base">Prêt à maîtriser vos matières aujourd&apos;hui ?</p>
            </div>
            <button className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent-purple text-white px-6 py-3 font-semibold shadow-lg shadow-primary/20 transition-all active:scale-95 group">
              <span className="material-symbols-outlined group-hover:animate-pulse" aria-hidden="true">play_circle</span>
              <span>Révision quotidienne</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-10">
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-4">
            {flashcardSubjects.map((subject) => (
              <FlashcardSubject key={subject.name} {...subject} />
            ))}
            <button
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
              <ProgressChart data={weeklyActivity} />
              <div className="flex flex-col gap-4">
                <div className="flex-1 rounded-2xl bg-surface border border-border p-5 flex items-center justify-between group hover:shadow-md transition-all shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-sm text-text-secondary font-medium mb-1">Série en cours</span>
                    <span className="text-2xl font-bold text-text-primary">{flashcardStats.currentStreak} Jours</span>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-accent-coral group-hover:scale-110 transition-transform" aria-hidden="true">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                  </div>
                </div>
                <div className="flex-1 rounded-2xl bg-surface border border-border p-5 flex items-center justify-between group hover:shadow-md transition-all shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-sm text-text-secondary font-medium mb-1">Total maîtrisé</span>
                    <span className="text-2xl font-bold text-text-primary">{flashcardStats.totalMastered.toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform" aria-hidden="true">
                    <span className="material-symbols-outlined">workspace_premium</span>
                  </div>
                </div>
                <div className="flex-1 rounded-2xl bg-surface border border-border p-5 flex items-center justify-between group hover:shadow-md transition-all shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-sm text-text-secondary font-medium mb-1">Précision</span>
                    <span className="text-2xl font-bold text-text-primary">{flashcardStats.accuracy}%</span>
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
    </div>
  )
}
