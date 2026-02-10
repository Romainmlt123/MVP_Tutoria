import { Link } from 'react-router-dom'
import ProgressCircle from './ProgressCircle'
import { gradientCardColors } from '../utils/colors'

export default function FlashcardSubject({ to, name, icon, cardCount = 0, progress = 0, color = 'blue', isGlobal = false }) {
  const c = gradientCardColors[color] || gradientCardColors.blue
  const content = (
    <>
      <div className="p-6 flex flex-col justify-between h-full gap-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white" aria-hidden="true">
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          <div className="flex items-center gap-2">
            {isGlobal && (
              <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-medium text-white/90">Global</span>
            )}
            {to && (
              <span className="material-symbols-outlined text-white/60 group-hover:text-white transition-colors">arrow_forward</span>
            )}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
            <p className="text-sm font-semibold text-white/70">
              {cardCount} {cardCount !== 1 ? 'cartes' : 'carte'}
            </p>
          </div>
          <ProgressCircle percent={Math.min(100, Math.round(progress))} light />
        </div>
      </div>
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-500" aria-hidden="true" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" aria-hidden="true" />
    </>
  )

  const className = `group relative overflow-hidden rounded-2xl ${c.bg} ${c.shadow} shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-white cursor-pointer block h-full min-h-[180px]`

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    )
  }
  return <div className={className}>{content}</div>
}
