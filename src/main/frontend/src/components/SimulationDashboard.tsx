import { useEffect, useMemo, useState } from 'react'
import type { AgentTrait } from '../types/agents.ts'
import CitizenCard, { type CitizenCardAgent } from './citizens/CitizenCard.tsx'
import LeaderboardPanel from './leaderboard/LeaderboardPanel.tsx'
import DiaryBubble, { type DiaryBubbleEntry } from './diary/DiaryBubble.tsx'
import MarketPlaceholder from './market/MarketPlaceholder.tsx'
import RibbonTitle from './ui/RibbonTitle.tsx'

const API_BASE = 'http://127.0.0.1:8000/api'

interface LiveAgentSnapshot {
  Agent_name: string
  financial_points: number
  current_asset_allocation: string
  is_bankrupt: boolean
}

interface LiveState {
  current_tick: number
  current_month: number
  market_condition: string
  agent_snapshots: LiveAgentSnapshot[]
  diary_entries: DiaryBubbleEntry[]
}

interface SimulationDashboardProps {
  onLiveMetaChange?: (tick?: number, marketMood?: string) => void
}

export default function SimulationDashboard({ onLiveMetaChange }: SimulationDashboardProps) {
  const [agents, setAgents] = useState<AgentTrait[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [simRunning, setSimRunning] = useState(false)
  const [starting, setStarting] = useState(false)
  const [liveState, setLiveState] = useState<LiveState | null>(null)

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/agents`)
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
        const data: AgentTrait[] = await res.json()
        setAgents(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchAgents()
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/simulation/status`)
        const data = await res.json()
        setSimRunning(data.running)
      } catch {
        // Ignore polling errors so the UI does not flicker.
      }
    }, 1600)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/simulation/live-state`)
        const data: LiveState = await res.json()
        setLiveState(data)
        onLiveMetaChange?.(data.current_tick, data.market_condition)
      } catch {
        // Live-state may not exist before the first simulation starts.
      }
    }, 1600)
    return () => clearInterval(interval)
  }, [onLiveMetaChange])

  const handleStartSimulation = async () => {
    try {
      setStarting(true)
      const res = await fetch(`${API_BASE}/simulation/start-simulation`, { method: 'POST' })
      const data = await res.json()
      if (data.status === 'Simulation started' || data.status === 'started') setSimRunning(true)
    } finally {
      setStarting(false)
    }
  }

  const liveAgents = (liveState?.agent_snapshots ?? agents) as CitizenCardAgent[]
  const agentBaseByName = useMemo(() => new Map(agents.map((agent) => [agent.Agent_name, agent])), [agents])
  const liveLeaderboard = [...liveAgents].sort((a, b) => b.financial_points - a.financial_points)
  const diaryEntries = liveState?.diary_entries ?? []

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="empty-state-card">
          <div className="mb-3 text-5xl animate-bounce">🏗️</div>
          <p className="text-lg font-black text-slate-700">Building FinnCity...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="empty-state-card border-red-100">
          <div className="mb-3 text-5xl">🚧</div>
          <p className="font-black text-red-500">Failed to load agents: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-grid h-full min-h-0 overflow-y-auto p-4 xl:overflow-hidden xl:p-6">
      <div className="min-h-0 space-y-5 xl:overflow-y-auto xl:pr-1">
        <section className="cartoon-panel citizens-panel p-4 md:p-5">
          <div className="mb-4 flex flex-col gap-3 border-b-2 border-dashed border-emerald-100 pb-4 md:flex-row md:items-center md:justify-between">
            <div>
              <RibbonTitle tone="amber">⭐ All Citizens ({agents.length})</RibbonTitle>
              <p className="mt-2 text-sm font-bold text-slate-500">Tap start and watch every citizen make money decisions.</p>
            </div>

            <button
              onClick={handleStartSimulation}
              disabled={simRunning || starting}
              className="start-button disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="text-xl">{simRunning ? '⏳' : starting ? '✨' : '▶️'}</span>
              {simRunning ? 'Simulation running' : starting ? 'Starting city...' : 'Start Simulation'}
            </button>
          </div>

          <div className="citizen-grid">
            {liveAgents.map((liveAgent) => {
              const baseAgent = agentBaseByName.get(liveAgent.Agent_name)
              return (
                <CitizenCard
                  key={liveAgent.Agent_name}
                  agent={liveAgent}
                  fallbackAllocation={baseAgent?.current_asset_allocation}
                />
              )
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(320px,0.9fr)_minmax(320px,1.1fr)]">
          <LeaderboardPanel agents={liveLeaderboard} tick={liveState?.current_tick} />
          <MarketPlaceholder />
        </div>
      </div>

      <aside className="cartoon-panel diary-panel min-h-[420px] p-5 xl:min-h-0 xl:overflow-hidden">
        <div className="sticky top-0 z-10 mb-4 bg-transparent pb-2">
          <RibbonTitle tone="blue">📖 Agent Diary</RibbonTitle>
          <p className="mt-3 text-sm font-bold text-slate-500">Fresh thoughts from the citizens of FinnCity.</p>
        </div>

        <div className="diary-scroll space-y-4 xl:max-h-[calc(100vh-250px)] xl:overflow-y-auto xl:pr-2">
          {diaryEntries.length === 0 ? (
            <div className="rounded-[24px] border-2 border-dashed border-amber-200 bg-amber-50/80 p-6 text-center">
              <div className="text-5xl">💌</div>
              <p className="mt-3 font-black text-slate-700">No diary entries yet...</p>
              <p className="mt-1 text-sm font-bold text-slate-500">Start the simulation to hear from everyone.</p>
            </div>
          ) : (
            [...diaryEntries].reverse().map((entry, idx) => (
              <DiaryBubble key={`${entry.Agent_name}-${entry.tick}-${idx}`} entry={entry} />
            ))
          )}
        </div>
      </aside>
    </div>
  )
}
