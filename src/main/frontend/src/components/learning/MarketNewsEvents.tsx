import { useEffect, useMemo, useState } from 'react'
import RibbonTitle from '../ui/RibbonTitle'
import { getLook } from '../../lib/agentPresentation'

const API_BASE = 'http://127.0.0.1:8000/api'

export type AssetImpact = {
  asset: string
  impact: number
  level: 'Low' | 'Medium' | 'High'
  direction: 'up' | 'down' | 'neutral'
}

export type MarketEvent = {
  id: string
  tick: number
  title: string
  category: string
  summary: string
  market_effect: string
  explanation: string
  asset_impacts: AssetImpact[]
}

export type DiaryEntry = {
  Agent_name: string
  reasoning: string
  tick: number
  type: 'bankrupt' | 'swing'
  outcome: number
}

type LiveState = {
  current_tick: number
  current_month: number
  market_condition: string
  market_event?: MarketEvent | null
  market_events?: MarketEvent[]
  diary_entries?: DiaryEntry[]
}

type MarketNewsEventsProps = {
  embedded?: boolean
  liveState?: LiveState | null
}

const fallbackEvent: MarketEvent = {
  id: 'briefing-0',
  tick: 0,
  title: 'Morning Market Briefing',
  category: 'Briefing',
  summary: 'Start the simulation to generate live market events that influence assets and agent decisions.',
  market_effect: 'Waiting',
  explanation: 'Market events help explain why some assets rise while others fall. When the simulation runs, this panel connects news, asset movement, and agent behaviour.',
  asset_impacts: [
    { asset: 'Technology Stock', impact: 0, level: 'Low', direction: 'neutral' },
    { asset: 'Banking Company Stock', impact: 0, level: 'Low', direction: 'neutral' },
    { asset: 'Petroleum Stock', impact: 0, level: 'Low', direction: 'neutral' },
    { asset: 'Doge Coin', impact: 0, level: 'Medium', direction: 'neutral' },
  ],
}

function impactIcon(direction: AssetImpact['direction']) {
  if (direction === 'up') return '▲'
  if (direction === 'down') return '▼'
  return '—'
}

function impactClass(direction: AssetImpact['direction']) {
  if (direction === 'up') return 'event-impact-positive'
  if (direction === 'down') return 'event-impact-negative'
  return 'event-impact-neutral'
}

function assetIcon(asset: string) {
  const lower = asset.toLowerCase()
  if (lower.includes('tech') || lower.includes('service')) return '💻'
  if (lower.includes('bank')) return '🏦'
  if (lower.includes('petroleum') || lower.includes('oil')) return '🛢️'
  if (lower.includes('doge') || lower.includes('coin')) return '🪙'
  if (lower.includes('game')) return '🎮'
  if (lower.includes('auto')) return '🚗'
  if (lower.includes('mineral')) return '⛏️'
  if (lower.includes('start')) return '🚀'
  return '📊'
}

function eventIllustration(category: string) {
  const lower = category.toLowerCase()
  if (lower.includes('bank') || lower.includes('rate')) return '🏦'
  if (lower.includes('oil') || lower.includes('energy')) return '🛢️'
  if (lower.includes('crypto')) return '🪙'
  if (lower.includes('tech')) return '💻'
  if (lower.includes('briefing')) return '📋'
  return '📈'
}

function marketLabel(condition?: string) {
  if (!condition) return 'Waiting for simulation'
  return condition.replaceAll('_', ' ')
}

function MarketNewsEventsContent({ liveState }: { liveState: LiveState | null }) {
  const currentEvent = liveState?.market_event ?? fallbackEvent
  const recentEvents = useMemo(() => {
    const events = liveState?.market_events ?? []
    return events.length > 0 ? events.slice(0, 4) : [fallbackEvent]
  }, [liveState])
  const diaryHighlights = (liveState?.diary_entries ?? []).slice(-3).reverse()

  return (
    <div className="market-news-content">
      <div className="learning-panel-heading">
        <RibbonTitle tone="green">📰 Market News & Events</RibbonTitle>
        <p>Connect market news, asset movement, and agent behaviour.</p>
      </div>

      <div className="market-news-grid">
        <div className="market-news-left">
          <section className="learning-card current-event-section">
            <div className="event-section-header">
              <div>
                <h3>Current Event</h3>
                <p>Tick #{currentEvent.tick} • Market mood: {marketLabel(liveState?.market_condition)}</p>
              </div>
              <span className="event-effect-pill">{currentEvent.market_effect}</span>
            </div>

            <div className="current-event-card">
              <div className="event-illustration">{eventIllustration(currentEvent.category)}</div>
              <div className="min-w-0 flex-1">
                <span className="event-current-chip">⚡ Live market signal</span>
                <h3>{currentEvent.title}</h3>
                <p className="event-summary-text">{currentEvent.summary}</p>
                <div className="event-explanation"><span>Why this matters: </span>{currentEvent.explanation}</div>
              </div>

              <div className="asset-impact-card">
                <h4>Impact on Assets</h4>
                <div className="mt-3 grid gap-3">
                  {currentEvent.asset_impacts.map((impact) => (
                    <div key={impact.asset} className="asset-impact-row">
                      <span className="asset-icon">{assetIcon(impact.asset)}</span>
                      <span className="min-w-0 flex-1 truncate font-black text-slate-700">{impact.asset}</span>
                      <span className={`font-black ${impactClass(impact.direction)}`}>{impactIcon(impact.direction)} {impact.impact > 0 ? '+' : ''}{impact.impact} ({impact.level})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="learning-card recent-events-section">
            <div className="mb-5 flex items-center justify-between">
              <h3>📋 Recent Events</h3>
              <span>Latest first</span>
            </div>
            <div className="grid gap-3">
              {recentEvents.map((event) => (
                <article key={event.id} className="recent-event-row">
                  <div className="event-tick-pill">Tick #{event.tick}</div>
                  <div className="event-row-icon">{eventIllustration(event.category)}</div>
                  <div className="min-w-0 flex-1">
                    <h3>{event.title}</h3>
                    <p>{event.summary}</p>
                  </div>
                  <div className="hidden gap-2 md:flex">
                    {event.asset_impacts.slice(0, 4).map((impact) => (
                      <span key={`${event.id}-${impact.asset}`} className={`mini-impact ${impactClass(impact.direction)}`}>{assetIcon(impact.asset)} {impact.impact > 0 ? '+' : ''}{impact.impact}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="market-news-right">
          <section className="learning-card">
            <RibbonTitle tone="purple">💡 How Events Move Markets</RibbonTitle>
            <div className="event-flow mt-5">
              <div>📰<span>Event occurs</span></div><strong>→</strong><div>🙂<span>Investors react</span></div><strong>→</strong><div>📈<span>Assets move</span></div><strong>→</strong><div>🧑‍🤝‍🧑<span>Agents decide</span></div>
            </div>
            <p className="mt-5 text-sm font-bold leading-7 text-slate-600">Financial markets are affected by news, sentiment, risk, and expectations. In FinnCity, every event helps explain why agents gain or lose coins.</p>
          </section>

          <section className="learning-card">
            <RibbonTitle tone="blue">📖 Diary Highlights</RibbonTitle>
            <div className="mt-4 grid gap-3">
              {diaryHighlights.length === 0 ? (
                <div className="empty-mini-card"><div className="text-4xl">💌</div><p>No agent reactions yet.</p><span>Start the simulation to connect news with decisions.</span></div>
              ) : (
                diaryHighlights.map((entry, idx) => (
                  <article key={`${entry.Agent_name}-${entry.tick}-${idx}`} className="event-diary-card">
                    <span className="leader-avatar">{getLook(entry.Agent_name).emoji}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2"><h3>{entry.Agent_name}</h3><span>Tick #{entry.tick}</span></div>
                      <p>“{entry.reasoning}”</p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default function MarketNewsEvents({ embedded = false, liveState: providedLiveState = null }: MarketNewsEventsProps) {
  const [liveState, setLiveState] = useState<LiveState | null>(providedLiveState)

  useEffect(() => {
    if (embedded) {
      setLiveState(providedLiveState ?? null)
      return
    }

    const fetchLiveState = async () => {
      try {
        const res = await fetch(`${API_BASE}/simulation/live-state`)
        if (!res.ok) return
        const data: LiveState = await res.json()
        setLiveState(data)
      } catch {
        // The page should remain usable before the backend starts.
      }
    }

    fetchLiveState()
    const interval = setInterval(fetchLiveState, 1600)
    return () => clearInterval(interval)
  }, [embedded, providedLiveState])

  if (embedded) return <MarketNewsEventsContent liveState={providedLiveState ?? liveState} />

  return (
    <div className="learning-page h-full min-h-0 overflow-y-auto p-4 xl:p-6">
      <MarketNewsEventsContent liveState={liveState} />
    </div>
  )
}
