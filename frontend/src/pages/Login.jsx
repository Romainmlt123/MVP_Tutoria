import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import useAuthStore from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, error, clearError, setError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    if (!email.trim() || !password) {
      setError('Renseigne ton email et ton mot de passe.')
      return
    }
    setLoading(true)
    const { error: err } = await signIn(email.trim(), password)
    setLoading(false)
    if (!err) {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f0f2f8] via-white to-[#ede7f6] font-display text-text-primary antialiased px-4 py-8">
      {/* Décors discrets */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 rounded-full bg-accent-purple/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Logo size="md" subtitle="Apprentissage Premium" textClassName="flex" />
        </div>

        {/* Carte formulaire */}
        <div className="rounded-2xl border border-border bg-surface shadow-xl shadow-primary/10 overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-accent-purple px-6 py-5 text-white">
            <h1 className="text-xl font-bold tracking-tight">Connexion</h1>
            <p className="text-sm text-white/80 mt-0.5">Entre tes identifiants pour accéder à Tutor&apos;IA</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
                <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
                <p>{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-text-primary mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </span>
                <input
                  id="login-email"
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
              <label htmlFor="login-password" className="block text-sm font-medium text-text-primary mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </span>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Mot de passe oublié ?
                </Link>
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
                  Connexion...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[22px]">login</span>
                  Se connecter
                </>
              )}
            </button>
          </form>
        </div>

        {/* Lien inscription */}
        <p className="text-center text-sm text-text-secondary mt-6">
          Pas encore de compte ?{' '}
          <Link to="/signup" className="font-medium text-primary hover:text-primary-dark">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
