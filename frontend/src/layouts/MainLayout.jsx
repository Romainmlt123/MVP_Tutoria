import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'
import useAuthStore from '../store/authStore'
import useProfileStore from '../store/profileStore'
import useUserSettingsStore from '../store/userSettingsStore'

export default function MainLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const resendConfirmationEmail = useAuthStore((s) => s.resendConfirmationEmail)
  const { profile, fetchProfile } = useProfileStore()
  const fetchSettings = useUserSettingsStore((s) => s.fetchSettings)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendDone, setResendDone] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const emailNotConfirmed = user && user.email && !user.email_confirmed_at

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id)
      fetchSettings(user.id)
    }
  }, [user?.id, fetchProfile, fetchSettings])

  useEffect(() => {
    if (profile && !profile?.settings?.onboarding?.completed) {
      navigate('/onboarding', { replace: true })
    }
  }, [profile, navigate])

  const handleResend = async () => {
    if (!user?.email || resendLoading) return
    setResendLoading(true)
    setResendDone(false)
    const { error } = await resendConfirmationEmail(user.email)
    setResendLoading(false)
    if (!error) setResendDone(true)
  }

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-slate-50 via-white to-primary/[0.06]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative flex flex-col pb-20 lg:pb-0">
        {emailNotConfirmed && !bannerDismissed && (
          <div className="shrink-0 flex items-center justify-between gap-4 px-4 py-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-amber-600 shrink-0">mail</span>
              <span>Vérifie ton email pour confirmer ton compte. Vérifie aussi tes spams.</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 font-medium disabled:opacity-60 transition-colors"
              >
                {resendLoading ? 'Envoi...' : resendDone ? 'Envoyé' : 'Renvoyer l\'email'}
              </button>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-200 transition-colors"
                aria-label="Fermer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>
        )}
        <div className="flex-1 min-h-0">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
