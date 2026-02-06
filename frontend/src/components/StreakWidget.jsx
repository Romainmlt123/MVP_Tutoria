const RING_RADIUS = 54
const SVG_SIZE = 128
const RING_CENTER = SVG_SIZE / 2

export default function StreakWidget({ days }) {
  const doneCount = days.filter(d => d.done).length
  const total = days.length
  const percent = Math.round((doneCount / total) * 100)
  const circumference = 2 * Math.PI * RING_RADIUS
  const dashOffset = circumference - (circumference * percent) / 100

  return (
    <div className="relative overflow-hidden rounded-2xl lg:col-span-4 bg-gradient-to-br from-orange-400 via-rose-400 to-pink-500 p-6 shadow-lg shadow-orange-500/20 text-white flex flex-col justify-between">
      {/* Éléments décoratifs */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-sm" aria-hidden="true" />
      <div className="absolute bottom-[-20px] left-[-10px] w-20 h-20 rounded-full bg-white/5" aria-hidden="true" />

      {/* En-tête */}
      <div className="relative z-10 flex items-center justify-between mb-2">
        <div>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Cette semaine</p>
          <h3 className="text-xl font-bold text-white mt-0.5">Ma série</h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm" aria-hidden="true">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
        </div>
      </div>

      {/* Anneau de progression */}
      <div className="relative z-10 flex items-center justify-center my-4" role="img" aria-label={`${doneCount} jours sur ${total} complétés`}>
        <div className="relative">
          <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className="drop-shadow-lg" aria-hidden="true">
            <circle cx={RING_CENTER} cy={RING_CENTER} r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
            <circle
              cx={RING_CENTER} cy={RING_CENTER} r={RING_RADIUS}
              fill="none" stroke="white" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-1000 ease-out"
              style={{ transform: 'rotate(-90deg)', transformOrigin: `${RING_CENTER}px ${RING_CENTER}px` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
            <span className="text-4xl font-bold text-white leading-none">{doneCount}</span>
            <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider mt-0.5">/ {total} jours</span>
          </div>
        </div>
      </div>

      {/* Indicateurs par jour */}
      <div className="relative z-10 flex items-center justify-between gap-1">
        {days.map((day) => (
          <div
            key={day.label}
            className={`flex-1 flex flex-col items-center gap-1.5 py-2 rounded-xl transition-all ${
              day.done ? 'bg-white/25 backdrop-blur-sm' : 'bg-white/5'
            }`}
          >
            <span className={`text-[10px] font-bold uppercase ${day.done ? 'text-white' : 'text-white/40'}`}>
              {day.label}
            </span>
            {day.done ? (
              <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-orange-500 text-[14px]" style={{ fontVariationSettings: "'wght' 700" }} aria-hidden="true">check</span>
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-white/30" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}