import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PersonaCard from '../components/PersonaCard'
import Toggle from '../components/Toggle'
import { personas } from '../data/mockData'
import useAuthStore from '../store/authStore'
import useProfileStore from '../store/profileStore'
import useUserSettingsStore from '../store/userSettingsStore'
import { SUBJECT_LABELS, LEVEL_LABELS, LEARNING_LABELS } from '../utils/onboardingContext'

const settingsNav = [
  { icon: 'person', label: 'Profil', id: 'profile' },
  { icon: 'auto_awesome', label: 'Préférences IA', id: 'ai' },
  { icon: 'notifications', label: 'Notifications', id: 'notifications' },
  { icon: 'credit_card', label: 'Abonnement', id: 'subscription' },
  { icon: 'shield', label: 'Confidentialité', id: 'privacy' },
]

export default function Settings() {
  const { user } = useAuthStore()
  const { profile, fetchProfile, updateProfile } = useProfileStore()
  const { settings, fetchSettings, upsertSettings, getAiPrefs } = useUserSettingsStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [selectedPersona, setSelectedPersona] = useState('encouraging')
  const [speechRate, setSpeechRate] = useState(1.2)
  const [interruptMode, setInterruptMode] = useState(false)
  const [autoPlay, setAutoPlay] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id)
      fetchSettings(user.id)
    }
  }, [user?.id, fetchProfile, fetchSettings])

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? '')
      setAvatarUrl(profile.avatar_url ?? '')
    }
  }, [profile])

  useEffect(() => {
    if (!settings) return
    const prefs = getAiPrefs()
    setSelectedPersona(prefs.persona)
    setSpeechRate(prefs.speechRate)
    setInterruptMode(prefs.interruptMode)
    setAutoPlay(prefs.autoPlay)
  }, [settings])

  const displayNameLabel = profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'
  const userEmail = user?.email ?? ''

  const navButtonClass = (id) =>
    `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors w-full text-left ${
      activeTab === id
        ? 'bg-primary/10 font-bold text-primary border border-primary/20'
        : 'font-medium text-text-secondary hover:bg-slate-50 hover:text-primary'
    }`

  return (
    <div className="page-shell bg-background font-display text-text-primary">
      <nav
        className="flex shrink-0 gap-1 overflow-x-auto hide-scrollbar border-b border-border bg-surface px-2 py-2 lg:hidden"
        aria-label="Paramètres"
      >
        {settingsNav.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={navButtonClass(item.id)}
            aria-current={activeTab === item.id ? 'page' : undefined}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="hidden lg:flex lg:w-72 shrink-0 flex-col border-r border-border bg-surface">
          <div className="border-b border-border px-6 py-5">
            <h1 className="text-lg font-bold text-text-primary">Paramètres</h1>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Paramètres">
            {settingsNav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={navButtonClass(item.id)}
                aria-current={activeTab === item.id ? 'page' : undefined}
              >
                <span className="material-symbols-outlined text-[24px]" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2">
              <div className="relative shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayNameLabel} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent-purple/20">
                    <span className="material-symbols-outlined text-[20px] text-primary">person</span>
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
              </div>
              <div className="min-w-0 overflow-hidden">
                <p className="truncate text-sm font-medium text-text-primary">{displayNameLabel}</p>
                <p className="truncate text-xs text-text-secondary">{userEmail || 'Forfait Étudiant'}</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="page-scroll p-4 sm:p-6 lg:p-10 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Onglet : Profil */}
            {activeTab === 'profile' && (
              <>
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">Profil</h2>
                  <p className="text-text-secondary text-base max-w-2xl">Gère ton nom d&apos;affichage et ton avatar.</p>
                </div>
                <section className="space-y-6" aria-labelledby="profile-heading">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary" aria-hidden="true">person</span>
                    <h3 id="profile-heading" className="text-xl font-bold text-text-primary">Informations</h3>
                  </div>
                  <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="profile-display-name" className="text-sm font-medium text-text-primary">Nom d&apos;affichage</label>
                      <input
                        id="profile-display-name"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={user?.email?.split('@')[0] || 'Mon pseudo'}
                        className="w-full rounded-xl border border-border bg-background py-3 px-4 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="profile-avatar-url" className="text-sm font-medium text-text-primary">URL de l&apos;avatar</label>
                      <input
                        id="profile-avatar-url"
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-xl border border-border bg-background py-3 px-4 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                      {avatarUrl && (
                        <div className="mt-2 flex items-center gap-3">
                          <img src={avatarUrl} alt="Aperçu" className="h-12 w-12 rounded-full object-cover border border-border" onError={(e) => { e.target.style.display = 'none' }} />
                          <span className="text-xs text-text-muted">Aperçu</span>
                        </div>
                      )}
                    </div>
                    {profileSaved && (
                      <p className="text-sm text-green-600 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        Profil enregistré.
                      </p>
                    )}
                  </div>
                </section>

                {/* Profil d'apprentissage (onboarding) */}
                <section className="space-y-6" aria-labelledby="onboarding-heading">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary" aria-hidden="true">school</span>
                      <h3 id="onboarding-heading" className="text-xl font-bold text-text-primary">Profil d&apos;apprentissage</h3>
                    </div>
                    <Link
                      to="/onboarding"
                      className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1 shrink-0"
                    >
                      Modifier
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                  <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
                    {profile?.settings?.onboarding?.completed ? (
                      <>
                        {(profile.settings.onboarding.firstName || profile.settings.onboarding.lastName) && (
                          <div>
                            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Identité</p>
                            <p className="text-text-primary font-medium">
                              {[profile.settings.onboarding.firstName, profile.settings.onboarding.lastName].filter(Boolean).join(' ') || '—'}
                            </p>
                          </div>
                        )}
                        {profile.settings.onboarding.levels && Object.keys(profile.settings.onboarding.levels).length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Niveaux par matière</p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {Object.entries(profile.settings.onboarding.levels).map(([id, level]) => (
                                <li key={id} className="flex justify-between items-center py-1.5 border-b border-border last:border-0">
                                  <span className="text-text-primary">{SUBJECT_LABELS[id] ?? id}</span>
                                  <span className="text-primary font-medium text-sm bg-primary/10 px-2 py-0.5 rounded">
                                    {LEVEL_LABELS[level] ?? level}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {profile.settings.onboarding.learningStyle && Object.keys(profile.settings.onboarding.learningStyle).length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">J&apos;aime apprendre avec</p>
                            <ul className="flex flex-wrap gap-2">
                              {Object.entries(profile.settings.onboarding.learningStyle)
                                .filter(([, v]) => v === true)
                                .map(([id]) => (
                                  <li key={id}>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-sm font-medium">
                                      <span className="material-symbols-outlined text-[16px]">check</span>
                                      {LEARNING_LABELS[id] ?? id}
                                    </span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-text-secondary text-sm">
                        Tu n&apos;as pas encore rempli ton profil d&apos;apprentissage. Cela permet à Tutor&apos;IA d&apos;adapter ses explications à ton niveau et à tes préférences.
                      </p>
                    )}
                    <Link
                      to="/onboarding"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
                    >
                      {profile?.settings?.onboarding?.completed ? 'Modifier mon profil d\'apprentissage' : 'Compléter mon profil d\'apprentissage'}
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </section>
              </>
            )}

            {/* Onglet : Préférences IA */}
            {activeTab === 'ai' && (
              <>
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">Préférences IA</h2>
                  <p className="text-text-secondary text-base max-w-2xl">Personnalisez la personnalité, la voix et le style d&apos;interaction de votre tuteur IA.</p>
                </div>

                <section className="space-y-5" aria-labelledby="persona-heading">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary" aria-hidden="true">psychology</span>
                    <h3 id="persona-heading" className="text-xl font-bold text-text-primary">Personnalité du tuteur</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {personas.map((p) => (
                      <PersonaCard key={p.id} {...p} selected={selectedPersona === p.id} onChange={setSelectedPersona} />
                    ))}
                  </div>
                </section>

                <hr className="border-border" />

                <section className="space-y-6" aria-labelledby="voice-heading">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary" aria-hidden="true">record_voice_over</span>
                    <h3 id="voice-heading" className="text-xl font-bold text-text-primary">Paramètres vocaux</h3>
                  </div>
                  <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 space-y-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="voice-model" className="text-sm font-medium text-text-primary">Modèle de voix</label>
                        <select
                          id="voice-model"
                          className="w-full appearance-none bg-slate-50 border border-border text-text-primary rounded-lg py-3 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
                        >
                          <option>Atlas (Homme - Grave &amp; Calme)</option>
                          <option>Nova (Femme - Énergique)</option>
                          <option>Luna (Femme - Douce &amp; Lente)</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-text-primary px-6 py-3 rounded-lg transition-colors font-medium border border-border">
                          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">play_circle</span>
                          Écouter un exemple
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <label htmlFor="speech-rate" className="text-sm font-medium text-text-primary">Vitesse de parole</label>
                        <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded text-sm" aria-live="polite">{speechRate}x</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-text-muted font-medium">0.5x</span>
                        <input
                          id="speech-rate"
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={speechRate}
                          onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                          aria-valuemin={0.5}
                          aria-valuemax={2}
                          aria-valuenow={speechRate}
                        />
                        <span className="text-xs text-text-muted font-medium">2.0x</span>
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-border" />

                <section className="space-y-6 pb-24" aria-labelledby="interaction-heading">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary" aria-hidden="true">tune</span>
                    <h3 id="interaction-heading" className="text-xl font-bold text-text-primary">Interaction</h3>
                  </div>
                  <div className="space-y-4">
                    <Toggle id="interrupt" icon="graphic_eq" title="Mode interruption" description="Permettre à l'IA d'intervenir si vous faites une pause trop longue." checked={interruptMode} onChange={setInterruptMode} />
                    <Toggle id="autoplay" icon="volume_up" title="Lecture audio automatique" description="Lire automatiquement les réponses textuelles à voix haute." checked={autoPlay} onChange={setAutoPlay} />
                  </div>
                  {settingsSaved && (
                    <p className="text-sm text-green-600 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      Préférences enregistrées.
                    </p>
                  )}
                </section>
              </>
            )}

            {/* Placeholder pour les autres onglets */}
            {activeTab !== 'profile' && activeTab !== 'ai' && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4" aria-hidden="true">
                  <span className="material-symbols-outlined text-primary text-[32px]">
                    {settingsNav.find(n => n.id === activeTab)?.icon}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  {settingsNav.find(n => n.id === activeTab)?.label}
                </h2>
                <p className="text-text-secondary max-w-md">
                  Cette section sera disponible prochainement. Restez connecté !
                </p>
              </div>
            )}
          </div>
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border bg-surface/95 p-4 backdrop-blur-md sm:px-6 lg:px-10">
          <button type="button" className="px-2 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-primary">Réinitialiser</button>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link to="/" className="hidden sm:block px-6 py-2.5 rounded-lg border border-border text-text-primary font-medium hover:bg-slate-50 transition-colors text-sm">Annuler</Link>
            <button
              type="button"
              onClick={async () => {
                if (!user?.id) return
                if (activeTab === 'profile') {
                  setProfileSaving(true)
                  setProfileSaved(false)
                  setSettingsSaved(false)
                  const { error } = await updateProfile(user.id, { display_name: displayName || null, avatar_url: avatarUrl || null })
                  setProfileSaving(false)
                  if (!error) setProfileSaved(true)
                } else if (activeTab === 'ai') {
                  setSettingsSaving(true)
                  setSettingsSaved(false)
                  setProfileSaved(false)
                  const current = settings ?? {}
                  const { error } = await upsertSettings(user.id, {
                    theme: current.theme ?? 'light',
                    language: current.language ?? 'fr',
                    notifications_enabled: current.notifications_enabled ?? true,
                    extra: { ...(current.extra ?? {}), persona: selectedPersona, speechRate, interruptMode, autoPlay },
                  })
                  setSettingsSaving(false)
                  if (!error) setSettingsSaved(true)
                }
              }}
              disabled={(profileSaving || settingsSaving) || !user?.id}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent-purple text-white font-bold shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5 text-sm flex items-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
            >
              {(profileSaving || settingsSaving) ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Enregistrement...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">save</span>
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </footer>
        </main>
      </div>
    </div>
  )
}
