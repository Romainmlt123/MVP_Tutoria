import { Link } from 'react-router-dom'
import { user } from '../data/mockData'
import Logo from './Logo'

export default function ChatHistory({ history, onNewChat, onClose }) {
  return (
    <aside className="w-full h-full bg-surface border-r border-border flex flex-col shadow-xl">
      {/* En-tête avec fermeture */}
      <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
        <Link to="/" className="inline-flex" onClick={onClose}>
          <Logo />
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-colors"
            aria-label="Fermer l'historique"
          >
            <span className="material-symbols-outlined text-[24px]" aria-hidden="true">close</span>
          </button>
        )}
      </div>

      {/* Nouvelle conversation */}
      <div className="px-4 py-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg py-2.5 px-4 transition-all duration-200 border border-primary/20 hover:border-primary/30 group font-semibold"
          aria-label="Créer une nouvelle conversation"
        >
          <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-90" aria-hidden="true">add</span>
          <span className="text-sm">Nouvelle conversation</span>
        </button>
      </div>

      {/* Historique */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
        {history.map((section) => (
          <div key={section.section} className="flex flex-col gap-1">
            <h3 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              {section.section}
            </h3>
            {section.items.map((item) => (
              <button
                key={item.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${
                  item.active
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'hover:bg-slate-50 text-text-secondary'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${item.active ? 'text-primary' : 'text-text-muted'}`} aria-hidden="true">
                  {item.icon}
                </span>
                <span className="text-sm font-medium truncate">{item.title}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Pied de page */}
      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group">
          <img src={user.avatar} alt={user.shortName} className="h-9 w-9 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/40 transition-colors" />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-text-primary truncate">{user.shortName} Morgan</span>
            <span className="text-xs text-text-secondary truncate">{user.plan}</span>
          </div>
          <Link to="/settings" className="ml-auto text-text-muted hover:text-primary transition-colors" aria-label="Paramètres">
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">settings</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}