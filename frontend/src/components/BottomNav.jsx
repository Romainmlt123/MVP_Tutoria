import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', icon: 'home', label: 'Accueil' },
  { to: '/explorer', icon: 'travel_explore', label: 'Explorer' },
  { to: '/chat', icon: 'chat_bubble', label: "Tutor'IA" },
  { to: '/flashcards', icon: 'style', label: 'Flashcards' },
  { to: '/analytics', icon: 'analytics', label: 'Tableau de bord' },
  { to: '/settings', icon: 'settings', label: 'Paramètres' },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-surface/95 backdrop-blur pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden"
      aria-label="Navigation mobile"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[64px] rounded-lg transition-colors touch-manipulation ${
              isActive
                ? 'text-primary bg-primary/10'
                : 'text-text-muted hover:text-primary active:bg-primary/5'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined text-[26px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
