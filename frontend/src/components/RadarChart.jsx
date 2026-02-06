const CENTER = 100
const RADIUS = 90

/** Coordonnées polaires → cartésiennes sur le radar. */
function getCoords(index, total, scale = 1) {
  const angle = ((360 / total) * index - 90) * (Math.PI / 180)
  return [CENTER + RADIUS * scale * Math.cos(angle), CENTER + RADIUS * scale * Math.sin(angle)]
}

/** Points d'un polygone régulier à une échelle donnée. */
function gridPolygon(total, scale) {
  return Array.from({ length: total }, (_, i) => getCoords(i, total, scale).join(',')).join(' ')
}

/** Détermine l'alignement du texte selon la position sur le radar. */
function textAnchor(index, total) {
  const angle = (((360 / total) * index - 90) % 360 + 360) % 360
  if (angle > 45 && angle < 135) return 'middle'
  if (angle >= 135 && angle <= 225) return 'end'
  if (angle > 225 && angle < 315) return 'middle'
  return 'start'
}

export default function RadarChart({ subjects }) {
  const n = subjects.length
  const dataPoints = subjects.map((s, i) => getCoords(i, n, s.value / 100).join(',')).join(' ')

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center">
      <h3 className="text-xl font-bold text-text-primary self-start mb-4">Répartition par matière</h3>
      <div className="relative w-full aspect-square max-w-[300px]">
        <svg
          className="w-full h-full"
          viewBox="0 0 200 200"
          role="img"
          aria-label={`Graphique radar : ${subjects.map(s => `${s.label} ${s.value}%`).join(', ')}`}
        >
          {/* Grille */}
          <g fill="none" stroke="var(--color-border)" strokeWidth="1">
            <polygon points={gridPolygon(n, 1)} />
            <polygon points={gridPolygon(n, 0.67)} opacity="0.5" />
            <polygon points={gridPolygon(n, 0.33)} opacity="0.3" />
            {subjects.map((_, i) => {
              const [x, y] = getCoords(i, n)
              return <line key={`axis-${i}`} x1={CENTER} y1={CENTER} x2={x} y2={y} opacity="0.3" />
            })}
          </g>

          {/* Zone de données */}
          <polygon
            points={dataPoints}
            fill="var(--color-primary)"
            fillOpacity="0.15"
            stroke="var(--color-primary)"
            strokeWidth="2"
          />

          {/* Points */}
          {subjects.map((s, i) => {
            const [cx, cy] = getCoords(i, n, s.value / 100)
            return <circle key={`dot-${i}`} cx={cx} cy={cy} r="4" fill="var(--color-primary)" stroke="white" strokeWidth="2" />
          })}

          {/* Labels */}
          {subjects.map((s, i) => {
            const [x, y] = getCoords(i, n, 1.18)
            return (
              <text
                key={`lbl-${i}`}
                x={x}
                y={y}
                textAnchor={textAnchor(i, n)}
                dominantBaseline="central"
                fill="var(--color-text-secondary)"
                fontSize="10"
                fontWeight="600"
              >
                {s.label}
              </text>
            )
          })}
        </svg>
      </div>
    </div>
  )
}