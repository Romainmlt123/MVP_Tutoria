import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="flex h-screen w-full items-center justify-center bg-background font-display">
      <div className="text-center px-6">
        <p className="text-8xl font-bold text-primary mb-4" aria-hidden="true">404</p>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Page introuvable</h1>
        <p className="text-text-secondary mb-8 max-w-md">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent-purple px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">home</span>
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
