import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import PersonaCard from '../components/PersonaCard'
import Toggle from '../components/Toggle'
import { user, personas } from '../data/mockData'

const settingsNav = [
  { icon: 'person', label: 'Profil', id: 'profile' },
  { icon: 'auto_awesome', label: 'Préférences IA', id: 'ai' },
  { icon: 'notifications', label: 'Notifications', id: 'notifications' },
  { icon: 'credit_card', label: 'Abonnement', id: 'subscription' },
  { icon: 'shield', label: 'Confidentialité', id: 'privacy' },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('ai')
  const [selectedPersona, setSelectedPersona] = useState('encouraging')
  const [speechRate, setSpeechRate] = useState(1.2)
  const [interruptMode, setInterruptMode] = useState(false)
  const [autoPlay, setAutoPlay] = useState(true)

  return (
    <div className="flex h-screen w-full bg-background font-display text-text-primary overflow-hidden">
      {/* Barre latérale */}
      <aside className="w-20 lg:w-72 flex-shrink-0 flex flex-col border-r border-border bg-surface transition-all duration-300">
        <div className="h-20 flex items-center px-6 lg:px-8 border-b border-border">
          <Link to="/" className="inline-flex">
            <Logo subtitle="Premium" textClassName="hidden lg:flex" />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2" aria-label="Paramètres">
          {settingsNav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-colors w-full text-left ${
                activeTab === item.id
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-text-secondary hover:bg-slate-50 hover:text-primary'
              }`}
              aria-current={activeTab === item.id ? 'page' : undefined}
            >
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">{item.icon}</span>
              <span className={`hidden lg:block text-sm ${activeTab === item.id ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
            <div className="relative shrink-0">
              <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white" />
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-sm font-medium text-text-primary truncate">{user.shortName} Morgan</p>
              <p className="text-xs text-text-secondary truncate">Forfait Étudiant</p>
            </div>
            <button className="hidden lg:flex ml-auto text-text-muted hover:text-red-500" aria-label="Se déconnecter">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-6 lg:p-12 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-10">
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
                </section>
              </>
            )}

            {/* Placeholder pour les autres onglets */}
            {activeTab !== 'ai' && (
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

        <div className="absolute bottom-0 w-full bg-surface/90 backdrop-blur-md border-t border-border p-4 lg:px-12 flex justify-between items-center z-10">
          <button className="text-text-secondary hover:text-primary text-sm font-medium px-4 py-2 transition-colors">Réinitialiser</button>
          <div className="flex gap-3">
            <Link to="/" className="hidden sm:block px-6 py-2.5 rounded-lg border border-border text-text-primary font-medium hover:bg-slate-50 transition-colors text-sm">Annuler</Link>
            <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent-purple text-white font-bold shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">save</span>
              Enregistrer
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
