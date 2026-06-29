import { useMemo, useState } from 'react'
import RibbonTitle from '../ui/RibbonTitle'
import { getLook } from '../../lib/agentPresentation'
import type { CitizenCardAgent } from '../citizens/CitizenCard'

export interface PlayerBet {
  agent_name: string
  amount: number
  placed_at_tick: number
  target_tick?: number
  status: string
}

export interface BetHistoryEntry {
  agent_name: string
  amount: number
  placed_at_tick: number
  resolved_at_tick: number
  status: 'won' | 'lost'
  net: number
  payout: number
  agent_gain: number
  winning_gain: number
  winning_agents: string[]
}

export interface PlayerState {
  coins: number
  active_bet: PlayerBet | null
  history: BetHistoryEntry[]
}

interface BetBoothProps {
  agents: CitizenCardAgent[]
  player: PlayerState | null
  currentTick?: number
  simulationRunning: boolean
  onPlaceBet: (agentName: string, amount: number) => Promise<void>
}

const quickAmounts = [10, 20, 50]

export default function BetBooth({ agents, player, currentTick = 0, simulationRunning, onPlaceBet }: BetBoothProps) {
  const sortedAgents = useMemo(() => [...agents].sort((a, b) => a.Agent_name.localeCompare(b.Agent_name)), [agents])
  const [selectedAgent, setSelectedAgent] = useState(sortedAgents[0]?.Agent_name ?? '')
  const [amount, setAmount] = useState(10)
  const [message, setMessage] = useState<string | null>(null)
  const [placing, setPlacing] = useState(false)

  const activeBet = player?.active_bet ?? null
  const coins = player?.coins ?? 100
  const canBet = !activeBet && coins > 0 && sortedAgents.length > 0

  const selectedLook = getLook(selectedAgent || sortedAgents[0]?.Agent_name || 'Mayor')

  const handlePlace = async () => {
    if (!selectedAgent) return
    try {
      setPlacing(true)
      setMessage(null)
      await onPlaceBet(selectedAgent, amount)
      setMessage(`Bet placed on ${selectedAgent}. Let the next tick decide!`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not place bet')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <section className="cartoon-panel bet-booth-panel p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <RibbonTitle tone="green">🎟️ Mayor Betting Booth</RibbonTitle>
        <div className="sparkle-badge">✨</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bet-stat-card">
          <span className="text-sm font-black text-slate-500">🪙 Your Coins</span>
          <div className="mt-1 flex items-end gap-3">
            <span className="text-4xl font-black text-slate-800">{coins}</span>
            <span className="pb-1 text-sm font-black text-slate-400">Mayor Coins</span>
          </div>
        </div>
        <div className="bet-stat-card bg-slate-50/90">
          <span className="text-sm font-black text-slate-500">⏱️ Next Round</span>
          <div className="mt-1 text-2xl font-black text-indigo-600">Tick #{currentTick + 1}</div>
          <p className="text-sm font-bold text-slate-400">Predict who earns the most points.</p>
        </div>
      </div>

      <div className="bet-form-card mt-4">
        <div>
          <h3 className="font-black text-emerald-700">🍀 Place your bet</h3>
          <p className="mt-1 text-sm font-bold text-slate-500">Choose one citizen before the next tick resolves.</p>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px_180px] lg:items-end">
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Citizen</span>
            <select
              value={selectedAgent}
              onChange={(event) => setSelectedAgent(event.target.value)}
              disabled={!canBet || placing}
              className="bet-input"
            >
              {sortedAgents.map((agent) => {
                const look = getLook(agent.Agent_name)
                return (
                  <option key={agent.Agent_name} value={agent.Agent_name}>
                    {look.emoji} {agent.Agent_name}
                  </option>
                )
              })}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">Bet amount</span>
            <input
              type="number"
              min={1}
              max={Math.max(coins, 1)}
              value={amount}
              disabled={!canBet || placing}
              onChange={(event) => setAmount(Number(event.target.value))}
              className="bet-input"
            />
          </label>

          <button onClick={handlePlace} disabled={!canBet || placing || amount <= 0 || amount > coins} className="bet-button">
            {placing ? 'Placing...' : 'Place Bet'}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {quickAmounts.map((value) => (
            <button key={value} type="button" disabled={!canBet || value > coins} onClick={() => setAmount(value)} className="quick-bet-button">
              {value}
            </button>
          ))}
          <button type="button" disabled={!canBet || coins <= 0} onClick={() => setAmount(coins)} className="quick-bet-button">
            All
          </button>
        </div>

        <div className="mayor-tip-card">
          <div className="mayor-tip-avatar">🐶</div>
          <div>
            <p className="mayor-tip-label">Mayor Pup says</p>
            <p className="mayor-tip-text">
              Pick one citizen and predict who earns the most points this tick.
            </p>
          </div>
        </div>
      </div>

      {message && <div className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">{message}</div>}

      <div className="mt-4 rounded-[24px] border-2 border-amber-100 bg-amber-50/60 p-4">
        <h3 className="mb-3 font-black text-slate-700">⏳ Active Bet</h3>
        {activeBet ? (
          <div className="active-bet-row">
            <div className="flex items-center gap-3">
              <span className="leader-avatar">{getLook(activeBet.agent_name).emoji}</span>
              <div>
                <p className="font-black text-slate-800">{activeBet.agent_name}</p>
                <p className="text-sm font-bold text-slate-500">Placed on Tick #{activeBet.placed_at_tick}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-slate-800">🪙 {activeBet.amount}</p>
              <p className="text-sm font-bold text-indigo-500">Waiting for Tick #{activeBet.target_tick}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm font-bold text-slate-500">No active bet yet. Pick a citizen and make your prediction.</p>
        )}
      </div>

      <div className="mt-4">
        <h3 className="mb-3 font-black text-slate-700">📋 Bet History</h3>
        <div className="grid gap-2">
          {(player?.history ?? []).length === 0 ? (
            <p className="rounded-2xl bg-white/70 p-4 text-sm font-bold text-slate-500">No completed bets yet.</p>
          ) : (
            player!.history.slice(0, 4).map((entry, idx) => (
              <div key={`${entry.agent_name}-${entry.resolved_at_tick}-${idx}`} className="bet-history-row">
                <span className={entry.status === 'won' ? 'result-chip win-chip' : 'result-chip lose-chip'}>
                  {entry.status === 'won' ? 'WIN' : 'LOSE'}
                </span>
                <span className="leader-avatar !h-8 !w-8 !text-base">{getLook(entry.agent_name).emoji}</span>
                <span className="font-black text-slate-700">{entry.agent_name}</span>
                <span className={entry.status === 'won' ? 'ml-auto font-black text-emerald-600' : 'ml-auto font-black text-red-500'}>
                  {entry.net > 0 ? '+' : ''}{entry.net} 🪙
                </span>
                <span className="text-sm font-bold text-slate-400">Tick #{entry.resolved_at_tick}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
