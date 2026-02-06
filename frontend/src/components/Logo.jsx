export default function Logo({ size = 'sm', subtitle = 'Apprentissage Premium', textClassName = '' }) {
  const isLarge = size === 'md'

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-primary to-accent-purple text-white ${
          isLarge ? 'h-10 w-10 rounded-xl shadow-lg shadow-primary/20' : 'h-8 w-8 rounded-lg shadow-md shadow-primary/20'
        }`}
        aria-hidden="true"
      >
        <span className={`material-symbols-outlined ${isLarge ? 'text-[24px]' : 'text-[20px]'}`}>school</span>
      </div>
      <div className={`flex flex-col ${textClassName}`}>
        <span className="text-lg font-bold leading-none text-text-primary tracking-tight">Tutor&apos;IA</span>
        {subtitle && <span className="text-xs text-text-secondary">{subtitle}</span>}
      </div>
    </div>
  )
}
