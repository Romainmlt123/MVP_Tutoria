import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', icon: 'home', label: 'Accueil' },
  { to: '/explorer', icon: 'travel_explore', label: 'Explorer' },
  { to: '/chat', icon: 'chat_bubble', label: "Tutor'IA" },
  { to: '/flashcards', icon: 'style', label: 'Flashcards' },
  { to: '/analytics', icon: 'analytics', label: 'Stats' },
  { to: '/settings', icon: 'settings', label: 'Réglages' },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch overflow-x-auto hide-scrollbar border-t border-border bg-surface/95 backdrop-blur pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] lg:hidden"
      aria-label="Navigation mobile"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex flex-none flex-col items-center justify-center gap-0.5 py-2 px-2.5 min-w-[4.25rem] max-w-[5.5rem] rounded-lg transition-colors touch-manipulation active:opacity-90 ${
              isActive
                ? 'text-primary bg-primary/10'
                : 'text-text-muted hover:text-primary active:bg-primary/5'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined text-[24px] shrink-0"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="text-[9px] sm:text-[10px] font-medium leading-tight text-center line-clamp-2 w-full px-0.5">
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
