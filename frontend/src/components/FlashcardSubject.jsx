import ProgressCircle from './ProgressCircle'
import { gradientCardColors } from '../utils/colors'

export default function FlashcardSubject({ name, icon, cardsDue, progress, color }) {
  const c = gradientCardColors[color] || gradientCardColors.blue

  return (
    <div className={`group relative overflow-hidden rounded-2xl ${c.bg} ${c.shadow} shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-white cursor-pointer`}>
      <div className="p-6 flex flex-col justify-between h-full gap-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white" aria-hidden="true">
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          <button className="text-white/60 hover:text-white transition-colors" aria-label={`Options pour ${name}`}>
            <span className="material-symbols-outlined" aria-hidden="true">more_horiz</span>
          </button>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
            <p className="text-sm font-semibold text-white/70">
              {cardsDue} {cardsDue > 1 ? 'Cartes à réviser' : 'Carte à réviser'}
            </p>
          </div>
          <ProgressCircle percent={progress} light />
        </div>
      </div>
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-500" aria-hidden="true" />
      <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" aria-hidden="true" />
    </div>
  )
}