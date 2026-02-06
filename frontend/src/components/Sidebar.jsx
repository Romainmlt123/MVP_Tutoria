import { NavLink } from 'react-router-dom'
import { user } from '../data/mockData'
import Logo from './Logo'

const navItems = [
  { to: '/', icon: 'home', label: 'Accueil' },
  { to: '/chat', icon: 'chat_bubble', label: "Tutor'IA" },
  { to: '/flashcards', icon: 'style', label: 'Flashcards' },
  { to: '/analytics', icon: 'analytics', label: 'Tableau de bord' },
]

export default function Sidebar() {
  return (
    <aside className="flex w-20 flex-col items-center border-r border-border bg-sidebar py-8 lg:w-64 lg:items-stretch lg:px-6 transition-all duration-300 z-20">
      {/* Logo */}
      <div className="mb-10 flex justify-center lg:justify-start">
        <Logo size="md" textClassName="hidden lg:flex" />
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
            <span className="hidden text-sm font-medium lg:block">{item.label}</span>
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
          <span className="hidden text-sm font-medium lg:block">Paramètres</span>
        </NavLink>

        {/* Profil */}
        <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
          <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20" />
          <div className="hidden overflow-hidden lg:block">
            <p className="truncate text-sm font-medium text-text-primary">{user.name}</p>
            <p className="truncate text-xs text-text-secondary">{user.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
