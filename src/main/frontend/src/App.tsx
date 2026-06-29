import { useState } from 'react'
import SimulationDashboard from './components/SimulationDashboard.tsx'
import AgentManagement from './components/AgentManagement.tsx'
import CityBackground from './components/layout/CityBackground.tsx'
import GameHeader from './components/layout/GameHeader.tsx'
import GameSidebar, { type ViewMode } from './components/layout/GameSidebar.tsx'
import './App.css'

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [currentTick, setCurrentTick] = useState<number | undefined>(undefined)
  const [marketMood, setMarketMood] = useState<string>('curious')

  return (
    <div className="finncity-shell min-h-screen w-screen overflow-hidden text-slate-800">
      <CityBackground />

      <div className="relative z-10 flex h-screen w-screen overflow-hidden">
        <GameSidebar viewMode={viewMode} onChangeView={setViewMode} />

        <main className="flex min-w-0 flex-1 flex-col p-4 md:p-6">
          <GameHeader
            viewMode={viewMode}
            tick={currentTick}
            marketMood={marketMood}
            onDashboardClick={() => setViewMode('dashboard')}
          />

          <div className="game-stage min-h-0 flex-1 overflow-hidden">
            {viewMode === 'dashboard' ? (
              <SimulationDashboard onLiveMetaChange={(tick, mood) => { setCurrentTick(tick); setMarketMood(mood || 'curious') }} />
            ) : (
              <AgentManagement />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
