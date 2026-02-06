export default function PersonaCard({ id, name, icon, description, selected, onChange }) {
  return (
    <label className="cursor-pointer group relative">
      <input type="radio" name="persona" value={id} checked={selected} onChange={() => onChange(id)} className="peer sr-only" />
      <div className={`h-full rounded-2xl border p-5 transition-all duration-200 flex flex-col gap-4 ${selected ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'border-border bg-surface hover:border-primary/30'}`}>
        <div className="flex justify-between items-start">
          <div className={`p-3 rounded-lg ${selected ? 'bg-gradient-to-br from-primary to-accent-purple text-white' : 'bg-slate-100 text-text-secondary group-hover:text-primary'} transition-colors`} aria-hidden="true">
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-primary bg-primary' : 'border-slate-300'}`} aria-hidden="true">
            {selected && <div className="h-2 w-2 rounded-full bg-white" />}
          </div>
        </div>
        <div>
          <p className="text-lg font-bold text-text-primary mb-1">{name}</p>
          <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
        </div>
      </div>
    </label>
  )
}