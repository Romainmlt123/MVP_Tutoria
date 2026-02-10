import { statCardColors } from '../utils/colors'

export default function StatCard({ label, value, change, changeLabel, icon, bgIcon, color, trend = 'up' }) {
  const c = statCardColors[color] || statCardColors.primary
  const isPositive = trend === 'up'

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity" aria-hidden="true">
        <span className={`material-symbols-outlined text-6xl ${c.bgIcon}`}>{bgIcon}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${c.iconBg}`}>
          <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
        </div>
        <p className="text-text-secondary text-sm font-medium">{label}</p>
      </div>
      <div>
        <p className="text-3xl font-bold text-text-primary mb-1">{value}</p>
        {(change != null && change !== '') && (
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              {isPositive ? 'trending_up' : 'trending_down'}
            </span>
            <span>{change}</span>
            {changeLabel != null && changeLabel !== '' && <span className="text-text-muted font-normal ml-1">{changeLabel}</span>}
          </div>
        )}
      </div>
    </div>
  )
}