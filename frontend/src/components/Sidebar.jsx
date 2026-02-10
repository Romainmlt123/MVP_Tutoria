import { useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import Logo from './Logo'
import useAuthStore from '../store/authStore'
import useProfileStore from '../store/profileStore'
import useChatStore from '../store/chatStore'

const navItems = [
  { to: '/', icon: 'home', label: 'Accueil' },
  { to: '/chat', icon: 'chat_bubble', label: "Tutor'IA" },
  { to: '/flashcards', icon: 'style', label: 'Flashcards' },
  { to: '/analytics', icon: 'analytics', label: 'Tableau de bord' },
]

function formatConversationDate(updatedAt) {
  if (!updatedAt) return ''
  const d = new Date(updatedAt)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuthStore()
  const { profile } = useProfileStore()
  const {
    conversations,
    currentConversationId,
    fetchConversations,
    loadConversation,
    clearCurrentConversation,
  } = useChatStore()
  const isChatPage = location.pathname === '/chat' || location.pathname === '/voice'

  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'
  const displayRole = user?.email ? 'Membre' : 'Invité'
  const avatarUrl = profile?.avatar_url

  useEffect(() => {
    if (user?.id && isChatPage) fetchConversations(user.id)
  }, [user?.id, isChatPage, fetchConversations])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const handleNewChat = () => {
    clearCurrentConversation()
  }

  const handleSelectConversation = (id) => {
    loadConversation(id)
  }

  return (
    <aside className="hidden lg:flex w-64 flex-col items-stretch border-r border-border bg-sidebar py-8 px-6 transition-all duration-300 z-20 min-h-0">
      {/* Logo */}
      <div className="mb-6 flex justify-start shrink-0">
        <Logo size="md" textClassName="flex" />
      </div>

      {/* Navigation (menu) */}
      <nav className="flex flex-col gap-2 shrink-0" aria-label="Navigation principale">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-primary to-accent-purple text-white shadow-lg shadow-primary/25'
                  : 'text-text-secondary hover:bg-primary/5 hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined" aria-hidden="true">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Zone historique (Vos conversations) - visible uniquement sur la page Tutor'IA */}
      {isChatPage && (
        <div className="flex flex-col flex-1 min-h-0 mt-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-3 mb-2">Vos conversations</p>
          <button
            type="button"
            onClick={handleNewChat}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-colors mb-2 shrink-0"
            aria-label="Nouvelle conversation"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nouvelle conversation
          </button>
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-1 pr-1">
            {conversations.length === 0 ? (
              <p className="px-3 py-2 text-xs text-text-muted">Aucune conversation</p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    currentConversationId === conv.id
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'hover:bg-slate-100 text-text-secondary border border-transparent'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[16px] shrink-0 ${currentConversationId === conv.id ? 'text-primary' : 'text-text-muted'}`}>chat_bubble</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium truncate block">{conv.title}</span>
                    <span className="text-xs text-text-muted">{formatConversationDate(conv.updated_at)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Bas : profil + déconnexion (Paramètres retiré pour laisser plus de place à l'historique) */}
      <div className="mt-auto flex flex-col gap-2 shrink-0 pt-4 border-t border-border">
        {/* Profil + Déconnexion */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20 shrink-0" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent-purple/20 flex items-center justify-center ring-2 ring-primary/20 shrink-0">
                <span className="material-symbols-outlined text-primary text-[20px]">person</span>
              </div>
            )}
            <div className="overflow-hidden min-w-0">
              <p className="truncate text-sm font-medium text-text-primary">{displayName}</p>
              <p className="truncate text-xs text-text-secondary">{user?.email || displayRole}</p>
            </div>
          </div>
          {user && (
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-red-600 hover:bg-red-50 transition-all w-full"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="text-sm font-medium">Déconnexion</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
