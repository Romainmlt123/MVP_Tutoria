import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import useAuthStore from '../store/authStore'

export default function Signup() {
  const navigate = useNavigate()
  const { signUp, error, clearError, setError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    if (!email.trim() || !password || !confirmPassword) {
      setError('Renseigne tous les champs.')
      return
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.')
      return
    }
    setLoading(true)
    const { error: err } = await signUp(email.trim(), password)
    setLoading(false)
    if (!err) {
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true }), 2000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f0f2f8] via-white to-[#ede7f6] font-display text-text-primary antialiased px-4">
        <div className="rounded-2xl border border-border bg-surface shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-[40px]">check_circle</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Compte créé</h2>
          <p className="text-text-secondary text-sm mb-4">
            Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi.
          </p>
          <p className="text-text-muted text-xs">Redirection vers la connexion...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f0f2f8] via-white to-[#ede7f6] font-display text-text-primary antialiased px-4 py-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 rounded-full bg-accent-purple/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-10">
          <Logo size="md" subtitle="Apprentissage Premium" textClassName="flex" />
        </div>

        <div className="rounded-2xl border border-border bg-surface shadow-xl shadow-primary/10 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-accent-purple px-6 py-5 text-white">
            <h1 className="text-xl font-bold tracking-tight">Créer un compte</h1>
            <p className="text-sm text-white/80 mt-0.5">Rejoins Tutor&apos;IA en quelques secondes</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
                <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
                <p>{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-text-primary mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </span>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="toi@exemple.com"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-text-primary mb-1.5">
                Mot de passe (min. 6 caractères)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </span>
                <input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-confirm" className="block text-sm font-medium text-text-primary mb-1.5">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </span>
                <input
                  id="signup-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent-purple py-3.5 text-white font-semibold shadow-lg shadow-primary/25 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[22px] animate-spin">progress_activity</span>
                  Création...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[22px]">person_add</span>
                  Créer mon compte
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
