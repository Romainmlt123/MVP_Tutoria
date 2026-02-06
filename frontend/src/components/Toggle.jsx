export default function Toggle({ id, checked, onChange, icon, title, description }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border shadow-sm">
      <div className="flex gap-4 items-center">
        <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-text-secondary" aria-hidden="true">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <p className="text-base font-medium text-text-primary" id={`${id}-label`}>{title}</p>
          <p className="text-sm text-text-secondary" id={`${id}-desc`}>{description}</p>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-desc`}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300 ${checked ? 'bg-primary' : 'bg-slate-200'}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}