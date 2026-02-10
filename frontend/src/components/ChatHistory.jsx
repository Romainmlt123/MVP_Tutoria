import { Link } from 'react-router-dom'
import Logo from './Logo'
import useAuthStore from '../store/authStore'
import useProfileStore from '../store/profileStore'

function formatConversationDate(updatedAt) {
  if (!updatedAt) return ''
  const d = new Date(updatedAt)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function ChatHistory({ conversations, currentConversationId, onSelectConversation, onNewChat, onClose }) {
  const { user } = useAuthStore()
  const { profile } = useProfileStore()
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Utilisateur'

  return (
    <aside className="w-full h-full bg-surface border-r border-border flex flex-col shadow-xl">
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

      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
        {conversations.length === 0 ? (
          <p className="px-3 text-xs text-text-muted">Aucune conversation</p>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => onSelectConversation(conv.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${
                currentConversationId === conv.id
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'hover:bg-slate-50 text-text-secondary'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] shrink-0 ${currentConversationId === conv.id ? 'text-primary' : 'text-text-muted'}`} aria-hidden="true">chat_bubble</span>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-medium truncate block">{conv.title}</span>
                <span className="text-xs text-text-muted">{formatConversationDate(conv.updated_at)}</span>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={displayName} className="h-9 w-9 rounded-full object-cover border-2 border-primary/20 shrink-0" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-accent-purple/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[18px]">person</span>
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-text-primary truncate">{displayName}</span>
            <span className="text-xs text-text-secondary truncate">{user?.email || 'Membre'}</span>
          </div>
          <Link to="/settings" className="ml-auto text-text-muted hover:text-primary transition-colors" aria-label="Paramètres">
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">settings</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}