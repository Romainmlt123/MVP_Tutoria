export default function ProgressCircle({ percent, size = 56, light = false }) {
  const label = `${percent}% de progression`

  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
        <path
          className={light ? 'text-white/20' : 'text-slate-100'}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className={light ? 'text-white' : 'text-primary'}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeDasharray={`${percent}, 100`}
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${light ? 'text-white' : 'text-text-primary'}`} aria-hidden="true">
        {percent}%
      </div>
    </div>
  )
}