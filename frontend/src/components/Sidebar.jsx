import { NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import useAuthStore from '../store/authStore'
import useProfileStore from '../store/profileStore'

const navItems = [
  { to: '/', icon: 'home', label: 'Accueil' },
  { to: '/chat', icon: 'chat_bubble', label: "Tutor'IA" },
  { to: '/flashcards', icon: 'style', label: 'Flashcards' },
  { to: '/analytics', icon: 'analytics', label: 'Tableau de bord' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  const { profile } = useProfileStore()
  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'
  const displayRole = user?.email ? 'Membre' : 'Invité'
  const avatarUrl = profile?.avatar_url

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="hidden lg:flex w-64 flex-col items-stretch border-r border-border bg-sidebar py-8 px-6 transition-all duration-300 z-20">
      {/* Logo */}
      <div className="mb-10 flex justify-start">
        <Logo size="md" textClassName="flex" />
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-2" aria-label="Navigation principale">
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

      {/* Bas */}
      <div className="mt-auto flex flex-col gap-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
              isActive
                ? 'bg-gradient-to-r from-primary to-accent-purple text-white shadow-lg shadow-primary/25'
                : 'text-text-secondary hover:bg-primary/5 hover:text-primary'
            }`
          }
        >
          <span className="material-symbols-outlined" aria-hidden="true">settings</span>
          <span className="text-sm font-medium">Paramètres</span>
        </NavLink>

        {/* Profil + Déconnexion */}
        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
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
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-text-secondary hover:bg-red-50 hover:text-red-600 transition-all w-full"
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
