import { smoothPath, valuesToPoints } from '../utils/chart'

const VIEW_W = 100
const VIEW_H = 40

export default function ProgressChart({ data, title = 'Activité' }) {
  const values = data.map(d => d.value)
  const points = valuesToPoints(values, VIEW_W, VIEW_H)
  const linePath = smoothPath(points)
  const areaPath = `${linePath} L${VIEW_W},${VIEW_H} L0,${VIEW_H} Z`

  /* Point max pour le tooltip */
  const maxIdx = values.indexOf(Math.max(...values))
  const maxPt = points[maxIdx]

  return (
    <div className="lg:col-span-2 rounded-2xl bg-surface border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-base font-semibold text-text-primary">{title}</h4>
        <select
          className="bg-transparent text-xs font-medium text-text-secondary focus:outline-none border-none cursor-pointer hover:text-primary"
          aria-label="Période d'activité"
        >
          <option>7 derniers jours</option>
          <option>30 derniers jours</option>
        </select>
      </div>
      <div className="relative h-48 w-full flex items-end gap-2">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={`Graphique d'activité : ${data.map(d => `${d.label} ${d.value}`).join(', ')}`}
        >
          <defs>
            <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#progressGrad)" />
          <path d={linePath} fill="none" stroke="var(--color-primary)" strokeLinecap="round" strokeWidth="0.8" />
        </svg>
        {/* Tooltip du point max */}
        {maxPt && (
          <div
            className="absolute flex flex-col items-center"
            style={{ left: `${(maxPt.x / VIEW_W) * 100}%`, top: `${(maxPt.y / VIEW_H) * 100}%` }}
          >
            <div className="px-2 py-1 bg-primary text-white text-xs font-bold rounded shadow-lg mb-2">
              {data[maxIdx].value} Cartes
            </div>
            <div className="h-2 w-2 bg-primary rounded-full border-2 border-surface" />
          </div>
        )}
      </div>
      <div className="flex justify-between mt-4 text-xs text-text-muted font-medium px-1">
        {data.map(d => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  )
}