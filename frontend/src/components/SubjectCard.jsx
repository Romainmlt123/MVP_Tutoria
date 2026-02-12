import { Link } from 'react-router-dom'
import { gradientCardColors } from '../utils/colors'

export default function SubjectCard({ name, subtitle, icon, color, slug, to }) {
  const c = gradientCardColors[color] || gradientCardColors.blue
  const href = to ?? `/chat?subject=${encodeURIComponent(slug || name)}`

  return (
    <Link
      to={href}
      className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer block group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${c.bg} ${c.shadow} shadow-lg text-white`}
      aria-label={`${name} — ${subtitle}`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm" aria-hidden="true">
        <span className="material-symbols-outlined text-white text-[28px]">{icon}</span>
      </div>

      <h4 className="text-xl font-bold text-white mb-1">{name}</h4>
      <p className="text-sm text-white/70 font-medium">{subtitle}</p>

      {/* Cercles décoratifs */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-500" aria-hidden="true" />
      <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-500" aria-hidden="true" />

      <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0" aria-hidden="true">
        <span className="material-symbols-outlined text-white/80 text-[20px]">arrow_forward</span>
      </div>
    </Link>
  )
}