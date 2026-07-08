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

const API_BASE = 'http://127.0.0.1:8000/api'
const quickAmounts = [10, 20, 50]

// --- Intervention prompt list ---
const MARKET_PROMPTS = [
  {
    type: 'hype',
    emoji: '🔥',
    label: 'Spread the Hype',
    description: 'Viral posts claim speculative stocks are skyrocketing. FOMO is real.',
    market_effect: 'bull_market',
  },
  {
    type: 'bull_signal',
    emoji: '📈',
    label: 'Economic Boom Signal',
    description: 'Government announces strong GDP growth. Investor confidence surges.',
    market_effect: 'bull_market',
  },
  {
    type: 'regulatory_warning',
    emoji: '📢',
    label: 'Financial Authority Regulatory Warning',
    description: 'Financial authority warns public about high-risk speculative assets.',
    market_effect: 'normal',
  },
  {
    type: 'panic',
    emoji: '📉',
    label: 'Market Crash Rumor',
    description: 'Unverified rumors of a market crash spreading on social media.',
    market_effect: 'bear_market',
  },
] as const

type InterventionType = typeof MARKET_PROMPTS[number]['type']
type ActiveTab = 'bet' | 'interact'

export default function BetBooth({
  agents,
  player,
  currentTick = 0,
  simulationRunning,
  onPlaceBet,
}: BetBoothProps) {
  const sortedAgents = useMemo(
    () => [...agents].sort((a, b) => a.Agent_name.localeCompare(b.Agent_name)),
    [agents]
  )
  const [selectedAgent, setSelectedAgent] = useState(sortedAgents[0]?.Agent_name ?? '')
  const [amount, setAmount] = useState(10)
  const [message, setMessage] = useState<string | null>(null)
  const [placing, setPlacing] = useState(false)

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('bet')

  // Intervention state
  const [interventionStatus, setInterventionStatus] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const activeBet = player?.active_bet ?? null
  const coins = player?.coins ?? 100
  const canBet =
    simulationRunning &&
    !activeBet &&
    coins > 0 &&
    sortedAgents.length > 0
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

  const handleIntervene = async (type: InterventionType) => {
    try {
      setSending(true)
      setInterventionStatus(null)
      const res = await fetch(`${API_BASE}/market/intervene`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervention_type: type, ticks_remaining: 2 }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.detail ?? 'Failed to intervene')
      }
      const data = await res.json()
      setInterventionStatus(
        `"${data.intervention_type}" is now active for ${data.ticks_remaining} ticks!`
      )
      // Auto-clear notifikasi setelah 8 detik
      setTimeout(() => setInterventionStatus(null), 8000)
    } catch (err) {
      setInterventionStatus(`${err instanceof Error ? err.message : 'Error'}`)
      setTimeout(() => setInterventionStatus(null), 5000)
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="cartoon-panel bet-booth-panel p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <RibbonTitle tone="green">🎟️ Mayor Betting Booth</RibbonTitle>
        <div className="sparkle-badge">✨</div>
      </div>

      {/* Tab Buttons */}
      <div className="mb-5 flex gap-2 border-b-2 border-dashed border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('bet')}
          className={`rounded-xl px-4 py-1.5 text-sm font-black transition ${
            activeTab === 'bet'
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          Place a Bet
        </button>
        <button
          onClick={() => setActiveTab('interact')}
          disabled={!simulationRunning}
          className={`rounded-xl px-4 py-1.5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${
            activeTab === 'interact'
              ? 'bg-amber-500 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          Interact with Market
        </button>
        {!simulationRunning && (
          <span className="self-center text-xs font-bold text-slate-400">
            (start simulation to unlock)
          </span>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'bet' ? (
        // ── BET TAB ──────────────────────────────────────────
        <>
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
              <p className="text-sm font-bold text-slate-400">
                Predict who earns the most points.
              </p>
            </div>
          </div>

          <div className="bet-form-card mt-4">
            <div>
              <h3 className="font-black text-emerald-700">🍀 Place your bet</h3>
              <p className="mt-1 text-sm font-bold text-slate-500">
                Choose one citizen before the next tick resolves.
              </p>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_220px_180px] lg:items-end">
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Citizen
                </span>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
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
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Bet amount
                </span>
                <input
                  type="number"
                  min={1}
                  max={Math.max(coins, 1)}
                  value={amount}
                  disabled={!canBet || placing}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="bet-input"
                />
              </label>

              <button
                onClick={handlePlace}
                disabled={!canBet || placing || amount <= 0 || amount > coins}
                className="bet-button"
              >
                {placing ? 'Placing...' : 'Place Bet'}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {quickAmounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={!canBet || value > coins}
                  onClick={() => setAmount(value)}
                  className="quick-bet-button"
                >
                  {value}
                </button>
              ))}
              <button
                type="button"
                disabled={!canBet || coins <= 0}
                onClick={() => setAmount(coins)}
                className="quick-bet-button"
              >
                All
              </button>
            </div>

            <div className="mayor-tip-card">
              <div className="mayor-tip-avatar">{selectedLook.emoji}</div>
              <div>
                <p className="mayor-tip-label">Mayor Pup says</p>
                <p className="mayor-tip-text">
                  Study {selectedAgent || 'a citizen'} and predict who earns the most points this
                  tick.
                </p>
              </div>
            </div>
          </div>

          {message && (
            <div className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
              {message}
            </div>
          )}

          <div className="mt-4 rounded-[24px] border-2 border-amber-100 bg-amber-50/60 p-4">
            <h3 className="mb-3 font-black text-slate-700">Active Bet</h3>
            {activeBet ? (
              <div className="active-bet-row">
                <div className="flex items-center gap-3">
                  <span className="leader-avatar">{getLook(activeBet.agent_name).emoji}</span>
                  <div>
                    <p className="font-black text-slate-800">{activeBet.agent_name}</p>
                    <p className="text-sm font-bold text-slate-500">
                      Placed on Tick #{activeBet.placed_at_tick}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-800">{activeBet.amount}</p>
                  <p className="text-sm font-bold text-indigo-500">
                    Waiting for Tick #{activeBet.target_tick}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm font-bold text-slate-500">
                No active bet yet. Pick a citizen and make your prediction.
              </p>
            )}
          </div>

          <div className="mt-4">
            <h3 className="mb-3 font-black text-slate-700">Bet History</h3>
            <div className="grid gap-2">
              {(player?.history ?? []).length === 0 ? (
                <p className="rounded-2xl bg-white/70 p-4 text-sm font-bold text-slate-500">
                  No completed bets yet.
                </p>
              ) : (
                player!.history.slice(0, 4).map((entry, idx) => (
                  <div
                    key={`${entry.agent_name}-${entry.resolved_at_tick}-${idx}`}
                    className="bet-history-row"
                  >
                    <span
                      className={
                        entry.status === 'won' ? 'result-chip win-chip' : 'result-chip lose-chip'
                      }
                    >
                      {entry.status === 'won' ? 'WIN' : 'LOSE'}
                    </span>
                    <span className="leader-avatar !h-8 !w-8 !text-base">
                      {getLook(entry.agent_name).emoji}
                    </span>
                    <span className="font-black text-slate-700">{entry.agent_name}</span>
                    <span
                      className={
                        entry.status === 'won'
                          ? 'ml-auto font-black text-emerald-600'
                          : 'ml-auto font-black text-red-500'
                      }
                    >
                      {entry.net > 0 ? '+' : ''}
                      {entry.net} 🪙
                    </span>
                    <span className="text-sm font-bold text-slate-400">
                      Tick #{entry.resolved_at_tick}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        // ── INTERACT WITH MARKET TAB ──────────────────────────
        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold text-slate-500">
              Inject a market signal into the simulation. It influences how every citizen reacts for{' '}
              <span className="font-black text-amber-600">2 ticks</span> based on their personality.
            </p>
          </div>

          {interventionStatus && (
            <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50 p-3 text-sm font-black text-amber-700">
              {interventionStatus}
            </div>
          )}

          <div className="space-y-3">
            {MARKET_PROMPTS.map((prompt) => (
              <button
                key={prompt.type}
                onClick={() => handleIntervene(prompt.type)}
                disabled={sending || !simulationRunning}
                className="w-full rounded-2xl border-2 border-slate-200 bg-white p-4 text-left transition hover:border-amber-300 hover:bg-amber-50/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{prompt.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-slate-700">{prompt.label}</p>
                    <p className="mt-0.5 text-xs font-bold text-slate-500">{prompt.description}</p>
                    <span
                      className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-black ${
                        prompt.market_effect === 'bull_market'
                          ? 'bg-emerald-100 text-emerald-700'
                          : prompt.market_effect === 'bear_market'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {prompt.market_effect === 'bull_market'
                        ? 'Forces Bull Market'
                        : prompt.market_effect === 'bear_market'
                        ? 'Forces Bear Market'
                        : 'Normalizes Market'}
                    </span>
                  </div>
                  <span className="shrink-0 self-center text-slate-300">→</span>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-[24px] border-2 border-dashed border-slate-200 bg-slate-50/60 p-4">
            <p className="text-xs font-black text-slate-500">💡 How it works</p>
            <p className="mt-1 text-xs font-bold text-slate-400">
              Each signal overrides the market condition for 2 ticks and is injected directly into
              each agent's decision prompt. Impulsive agents chase hype, analytical ones think twice,
              contrarians do the opposite.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}