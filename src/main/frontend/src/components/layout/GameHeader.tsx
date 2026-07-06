import type { ViewMode } from './GameSidebar'
import { formatTick } from '../../lib/agentPresentation'

interface GameHeaderProps {
  viewMode: ViewMode
  tick?: number
  marketMood?: string
  onDashboardClick: () => void
}

function modeLabel(viewMode: ViewMode) {
  if (viewMode === 'dashboard') return 'DASHBOARD'
  if (viewMode === 'learning') return 'LEARNING'
  return 'AGENTS'
}

export default function GameHeader({ viewMode, tick, marketMood, onDashboardClick }: GameHeaderProps) {
  return (
    <header className="game-header">
      <div className="flex items-center gap-4">
        <button onClick={onDashboardClick} className="header-play-button" title="Go to dashboard">
          ▶
        </button>
        <div>
          <h1 className="logo-title">
            Finn<span>City</span><b>.</b>
          </h1>
          <p className="text-sm font-bold text-slate-500">
            {viewMode === 'learning' ? 'Learn. Invest. Grow.' : 'A cheerful little city of financial agents'}
          </p>
        </div>
      </div>

      <div className="header-pills">
        <span className="info-pill info-pill-blue">☀️ Sunny</span>
        <span className="info-pill info-pill-green">Mood: {marketMood || 'curious'}</span>
        <span className="info-pill info-pill-purple">Mode: {modeLabel(viewMode)}</span>
        <span className="info-pill info-pill-amber">Tick: {formatTick(tick)}</span>
        <span className="rounded-full bg-white px-3 py-2 text-xl shadow-sm">🐾</span>
      </div>
    </header>
  )
}
