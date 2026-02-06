import { Link } from 'react-router-dom'
import StreakWidget from '../components/StreakWidget'
import SubjectCard from '../components/SubjectCard'
import { user, quickAccessSubjects, streakDays } from '../data/mockData'

export default function Home() {

  return (
    <div className="container mx-auto max-w-7xl px-6 py-8 lg:px-12">
      {/* En-tête */}
      <header className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-text-primary mb-2">Bonjour, {user.name} 👋</h1>
          <p className="text-text-secondary text-lg font-light italic">
            « Le succès est la somme de petits efforts répétés jour après jour. »
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm" aria-label="Notifications">
            <span className="material-symbols-outlined" aria-hidden="true">notifications</span>
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-text-secondary hover:text-primary hover:border-primary/30 transition-colors shadow-sm" aria-label="Rechercher">
            <span className="material-symbols-outlined" aria-hidden="true">search</span>
          </button>
        </div>
      </header>

      {/* Grille */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:grid-rows-[auto_auto]">
        {/* Carte principale */}
        <div className="relative overflow-hidden rounded-2xl lg:col-span-8 group min-h-[280px] flex flex-col md:flex-row bg-gradient-to-r from-primary via-[#7c6cf0] to-accent-purple text-white shadow-xl shadow-primary/20">
          <div className="relative z-10 flex flex-1 flex-col justify-center p-8">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">Physique</span>
              <span className="text-xs text-white/70">• 45 min restantes</span>
            </div>
            <h2 className="mb-1 text-3xl font-bold">Mécanique quantique</h2>
            <p className="mb-6 max-w-md text-white/80">
              Chapitre 4 : L&apos;équation de Schrödinger et l&apos;interprétation de la fonction d&apos;onde.
            </p>

            {/* Barre de progression */}
            <div className="mb-6 max-w-md">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-white/70">Progression</span>
                <span className="font-medium text-white">65%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/20" role="progressbar" aria-valuenow={65} aria-valuemin={0} aria-valuemax={100} aria-label="Progression du chapitre">
                <div className="h-full w-[65%] rounded-full bg-white shadow-md" />
              </div>
            </div>

            <div>
              <Link to="/chat" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary shadow-lg hover:bg-white/90 transition-transform active:scale-95">
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">play_arrow</span>
                Continuer
              </Link>
            </div>
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

        {/* Widget de série */}
        <StreakWidget days={streakDays} />

        {/* Accès rapide */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-text-primary">Accès rapide</h3>
            <Link to="/flashcards" className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1">
              Voir tout <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickAccessSubjects.map((subject) => (
              <SubjectCard key={subject.name} {...subject} />
            ))}
          </div>
        </section>

        {/* Flashcards du jour */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all lg:col-span-4 flex flex-col h-full min-h-[260px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <span className="relative flex h-3 w-3" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
              </span>
              À réviser
            </h3>
            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">25 Cartes</span>
          </div>

          <Link to="/flashcards" className="relative flex-1 mt-2 group cursor-pointer block">
            <div className="absolute top-4 left-4 right-4 bottom-0 rounded-2xl bg-slate-100 border border-border opacity-50 scale-90 origin-bottom transition-transform duration-300 group-hover:translate-y-2" aria-hidden="true" />
            <div className="absolute top-2 left-2 right-2 bottom-0 rounded-2xl bg-slate-50 border border-border opacity-80 scale-95 origin-bottom transition-transform duration-300 group-hover:translate-y-1" aria-hidden="true" />
            <div className="absolute inset-0 rounded-2xl bg-surface border border-border p-5 shadow-md flex flex-col justify-center items-center text-center transition-transform duration-300 group-hover:-translate-y-1">
              <div className="mb-3 rounded-full bg-primary/10 p-2 text-primary" aria-hidden="true">
                <span className="material-symbols-outlined">psychology_alt</span>
              </div>
              <h4 className="text-text-primary font-medium mb-2">Qu&apos;est-ce que le principe d&apos;incertitude de Heisenberg ?</h4>
              <p className="text-xs text-text-muted uppercase tracking-wider font-bold">Physique • Quantique</p>
              <div className="mt-4 w-full">
                <span className="block w-full rounded-lg bg-primary/5 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
                  Retourner la carte
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
