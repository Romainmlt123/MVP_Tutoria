import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import useAuthStore from '../store/authStore'

export default function ForgotPassword() {
  const { resetPasswordForEmail, error, clearError, setError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    if (!email.trim()) {
      setError('Renseigne ton adresse email.')
      return
    }
    setLoading(true)
    setSent(false)
    const { error: err } = await resetPasswordForEmail(email.trim())
    setLoading(false)
    if (!err) setSent(true)
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
            <h1 className="text-xl font-bold tracking-tight">Mot de passe oublié</h1>
            <p className="text-sm text-white/80 mt-0.5">Entre ton email pour recevoir un lien de réinitialisation</p>
          </div>

          {sent ? (
            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-800 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
                <p>Un email t&apos;a été envoyé. Vérifie ta boîte mail (et les spams) pour réinitialiser ton mot de passe.</p>
              </div>
              <Link
                to="/login"
                className="block w-full text-center rounded-xl bg-primary/10 text-primary font-medium py-3 hover:bg-primary/20 transition-colors"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
                  <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-text-primary mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </span>
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="toi@exemple.com"
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
                    Envoi...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[22px]">send</span>
                    Envoyer le lien
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}
