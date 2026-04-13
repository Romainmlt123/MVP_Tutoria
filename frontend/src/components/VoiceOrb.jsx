const STATUS_STYLES = {
  connecting: {
    core: 'from-amber-300 via-amber-400 to-orange-500',
    glow: 'shadow-[0_0_60px_rgba(251,191,36,0.45)]',
  },
  error: {
    core: 'from-rose-300 via-red-400 to-red-600',
    glow: 'shadow-[0_0_60px_rgba(239,68,68,0.4)]',
  },
  ready: {
    core: 'from-cyan-300 via-blue-400 to-primary',
    glow: 'shadow-[0_0_60px_rgba(108,92,231,0.4)]',
  },
  speaking: {
    core: 'from-fuchsia-300 via-primary-light to-primary-dark',
    glow: 'shadow-[0_0_70px_rgba(108,92,231,0.55)]',
  },
  disconnected: {
    core: 'from-slate-300 via-slate-400 to-slate-500',
    glow: 'shadow-[0_0_45px_rgba(148,163,184,0.35)]',
  },
}

export default function VoiceOrb({ status = 'ready', assistantSpeaking = false, size = 'center' }) {
  const isLarge = size === 'center'
  const style = STATUS_STYLES[status] || STATUS_STYLES.ready
  const coreSize = isLarge ? 'w-44 h-44 md:w-52 md:h-52' : 'w-14 h-14'
  const ringSize = isLarge ? 'w-56 h-56 md:w-64 md:h-64' : 'w-20 h-20'
  const pulse = assistantSpeaking ? 'animate-orb-speaking' : 'animate-orb-idle'
  const ringPulse = assistantSpeaking ? 'animate-orb-ring-fast' : 'animate-orb-ring-slow'

  return (
    <div
      className={`relative flex items-center justify-center ${isLarge ? 'h-64 md:h-72' : 'h-16'}`}
      role="img"
      aria-label={assistantSpeaking ? "Orbe vocale active" : "Orbe vocale en attente"}
    >
      <span className={`absolute rounded-full border border-white/40 ${ringSize} ${ringPulse}`} />
      <span className={`absolute rounded-full border border-primary/20 ${isLarge ? 'w-48 h-48 md:w-56 md:h-56' : 'w-16 h-16'} ${ringPulse}`} />
      <div
        className={`${coreSize} rounded-full bg-gradient-to-br ${style.core} ${style.glow} ${pulse} relative overflow-hidden`}
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.95),rgba(255,255,255,0)_45%)]" />
        <span className="absolute -inset-8 bg-[conic-gradient(from_180deg,rgba(255,255,255,0),rgba(255,255,255,0.35),rgba(255,255,255,0))] animate-orb-rotate" />
      </div>
    </div>
  )
}
