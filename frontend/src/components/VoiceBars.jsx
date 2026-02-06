/**
 * 5 traits épais animés (style égaliseur) pour le mode vocal.
 * Animation depuis le centre (haut et bas), irrégulière.
 * IMPORTANT: Animation UNIQUEMENT quand l'IA parle (assistantSpeaking), pas quand l'utilisateur parle.
 */
const DURATIONS = [0.62, 0.78, 0.55, 0.85, 0.58]
const DELAYS = [0, 0.17, 0.06, 0.24, 0.11]

export default function VoiceBars({ status = 'ready', assistantSpeaking = false, size = 'footer' }) {
  const barCount = 5
  const isLarge = size === 'center'
  const baseClass = isLarge ? 'w-4 rounded-full h-20' : 'w-2.5 rounded-full h-10'
  const statusStyles = {
    connecting: 'bg-amber-500',
    error: 'bg-red-500',
    ready: 'bg-green-500',
    speaking: 'bg-primary',
    disconnected: 'bg-slate-400',
  }
  const barColor = statusStyles[status] || statusStyles.ready
  // Animation UNIQUEMENT quand l'IA parle (assistantSpeaking)
  const shouldAnimate = assistantSpeaking

  return (
    <div
      className={`flex items-end justify-center gap-1.5 ${isLarge ? 'h-24 md:h-28' : 'h-10'}`}
      role="img"
      aria-label={assistantSpeaking ? "IA en train de parler" : status === 'ready' ? "En écoute" : "Prêt"}
    >
      {Array.from({ length: barCount }, (_, i) => (
        <div
          key={i}
          className={`${baseClass} ${barColor}`}
          style={{
            transformOrigin: 'center',
            ...(shouldAnimate
              ? {
                  animationName: 'voice-bar',
                  animationDuration: `${DURATIONS[i]}s`,
                  animationDelay: `${DELAYS[i]}s`,
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'ease-in-out',
                }
              : {
                  transform: 'scaleY(0.4)',
                  animation: 'none',
                }),
          }}
        />
      ))}
    </div>
  )
}
