import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', icon: 'home', label: 'Accueil', shortLabel: 'Accueil' },
  { to: '/explorer', icon: 'travel_explore', label: 'Explorer', shortLabel: 'Îles' },
  { to: '/chat', icon: 'chat_bubble', label: "Tutor'IA", shortLabel: 'Tutor' },
  { to: '/flashcards', icon: 'style', label: 'Flashcards', shortLabel: 'Fiches' },
  { to: '/analytics', icon: 'analytics', label: 'Stats', shortLabel: 'Stats' },
  { to: '/settings', icon: 'settings', label: 'Réglages', shortLabel: 'Régl.' },
]

export default function BottomNav() {
  return (
    <nav
      className="app-bottom-nav fixed inset-x-0 bottom-0 z-50 flex w-full max-w-[100vw] items-stretch border-t border-border bg-surface/95 backdrop-blur md:hidden supports-[backdrop-filter]:bg-surface/90"
      aria-label="Navigation mobile"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          title={item.label}
          className={({ isActive }) =>
            `flex min-h-[var(--app-bottom-nav-height)] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 transition-colors touch-manipulation active:opacity-90 ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-text-muted hover:text-primary active:bg-primary/5'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined shrink-0 text-[22px] sm:text-[24px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                aria-hidden
              >
                {item.icon}
              </span>
              <span className="hidden max-w-full truncate px-0.5 text-[10px] font-medium leading-none min-[380px]:block">
                {item.label}
              </span>
              <span className="max-w-full truncate px-0.5 text-[9px] font-medium leading-none min-[380px]:hidden">
                {item.shortLabel}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
