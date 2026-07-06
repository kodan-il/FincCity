export type ViewMode = 'dashboard' | 'learning' | 'management'

interface GameSidebarProps {
  viewMode: ViewMode
  onChangeView: (mode: ViewMode) => void
}

const navItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: '🏘️' },
  { id: 'learning' as const, label: 'Learning', icon: '🎓' },
  { id: 'management' as const, label: 'Agents', icon: '🧑‍🤝‍🧑' },
]

export default function GameSidebar({ viewMode, onChangeView }: GameSidebarProps) {
  return (
    <aside className="hidden w-28 shrink-0 flex-col items-center justify-between py-6 pl-5 md:flex">
      <div className="playful-dock flex flex-col items-center gap-5 px-3 py-5">
        <div className="bank-badge">🏦</div>
        {navItems.map((item) => {
          const active = viewMode === item.id
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`dock-button group ${active ? 'dock-button-active' : ''}`}
              title={item.label}
            >
              <span className="dock-icon">{item.icon}</span>
              <span className="dock-label">{item.label}</span>
            </button>
          )
        })}
      </div>

      <div className="mascot-card mb-2">
        <div className="text-4xl">🐶</div>
        <span>Mayor Pup</span>
      </div>
    </aside>
  )
}
