import { useEffect, useState } from 'react'

interface StockTickEntry {
    tick: number
    stocks: { name: string; type: string; trend: string; outcome: number }[]
}

interface AgentPointsEntry {
    tick: number
    points: { agent_name: string; financial_points: number; is_bankrupt: boolean }[]
}

function StockTrendChart({ data }: { data: StockTickEntry[] }) {
    if (!data || data.length === 0) {
        return <p className="text-xs text-slate-500 italic py-8">Start simulation to see stock conditions...</p>
    }

    const stockNames = Array.from(
        new Set(data.flatMap((d) => d.stocks?.map((s) => s.name) || []))
    )

    if (stockNames.length === 0) {
        return <p className="text-xs text-slate-500 italic py-8">No stock data available...</p>
    }

    // Get all unique outcomes for scaling
    const allOutcomes = data.flatMap((d) => d.stocks?.map((s) => s.outcome) || [])
    const minOutcome = Math.min(...allOutcomes, 0)
    const maxOutcome = Math.max(...allOutcomes, 1)
    const range = maxOutcome - minOutcome || 1

    const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#6366f1']

    return (
        <div className="space-y-4">
            {stockNames.slice(0, 3).map((stockName, colorIdx) => {
                const stockData = data
                    .map((d) => {
                        const found = d.stocks?.find((s) => s.name === stockName)
                        return found ? { tick: d.tick, outcome: found.outcome } : null
                    })
                    .filter(Boolean) as { tick: number; outcome: number }[]

                if (stockData.length === 0) return null

                const points = stockData
                    .map((d, idx) => {
                        const x = (idx / Math.max(stockData.length - 1, 1)) * 100
                        const y = 100 - ((d.outcome - minOutcome) / range) * 100
                        return `${x},${y}`
                    })
                    .join(' ')

                return (
                    <div key={stockName} className="learning-chart-card">
                        <div className="chart-grid-lines" />
                        <svg className="learning-trend-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id={`stockFill-${colorIdx}`} x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor={colors[colorIdx % colors.length]} stopOpacity="0.36" />
                                    <stop offset="100%" stopColor={colors[colorIdx % colors.length]} stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <polygon points={`0,100 ${points} 100,100`} fill={`url(#stockFill-${colorIdx})`} />
                            <polyline points={points} fill="none" stroke={colors[colorIdx % colors.length]} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="trend-label trend-label-final text-xs">{stockName}</div>
                    </div>
                )
            })}
        </div>
    )
}

function AgentPointsTrendChart({ data, visibleAgents }: { data: AgentPointsEntry[]; visibleAgents: Set<string> }) {
    if (!data || data.length === 0) {
        return <p className="text-xs text-slate-500 italic py-8">Start simulation to see agent points...</p>
    }

    const allAgents = Array.from(
        new Set(data.flatMap((d) => d.points?.map((p) => p.agent_name) || []))
    ).filter((name) => visibleAgents.has(name))

    if (allAgents.length === 0) {
        return <p className="text-xs text-slate-500 italic py-8">No agents selected or data available...</p>
    }

    const allPoints = data.flatMap((d) =>
        d.points?.filter((p) => visibleAgents.has(p.agent_name)).map((p) => p.financial_points) || []
    )

    if (allPoints.length === 0) return null

    const minPoints = Math.min(...allPoints, 0)
    const maxPoints = Math.max(...allPoints, 1)
    const range = maxPoints - minPoints || 1

    const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#6366f1']

    return (
        <div className="space-y-4">
            {allAgents.map((agentName, colorIdx) => {
                const agentData = data
                    .map((d) => {
                        const found = d.points?.find((p) => p.agent_name === agentName)
                        return found ? { tick: d.tick, points: found.financial_points } : null
                    })
                    .filter(Boolean) as { tick: number; points: number }[]

                if (agentData.length === 0) return null

                const points = agentData
                    .map((d, idx) => {
                        const x = (idx / Math.max(agentData.length - 1, 1)) * 100
                        const y = 100 - ((d.points - minPoints) / range) * 100
                        return `${x},${y}`
                    })
                    .join(' ')

                return (
                    <div key={agentName} className="learning-chart-card">
                        <div className="chart-grid-lines" />
                        <svg className="learning-trend-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id={`agentFill-${colorIdx}`} x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor={colors[colorIdx % colors.length]} stopOpacity="0.36" />
                                    <stop offset="100%" stopColor={colors[colorIdx % colors.length]} stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <polygon points={`0,100 ${points} 100,100`} fill={`url(#agentFill-${colorIdx})`} />
                            <polyline points={points} fill="none" stroke={colors[colorIdx % colors.length]} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="trend-label trend-label-final text-xs">{agentName}</div>
                    </div>
                )
            })}
        </div>
    )
}

export default function MarketChart({
  stockHistory,
  agentPointsHistory,
  agents,
}: {
  stockHistory: StockTickEntry[]
  agentPointsHistory: AgentPointsEntry[]
  agents: { Agent_name: string }[]
}) {
  const [activeTab, setActiveTab] = useState<'stocks' | 'agents'>('stocks')
  const [visibleAgents, setVisibleAgents] = useState<Set<string>>(
    new Set(agents.map((a) => a.Agent_name))
  )

  const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#6366f1']
  const colorMap = new Map(agents.map((a, idx) => [a.Agent_name, colors[idx % colors.length]]))

  const toggleAgent = (name: string) => {
    setVisibleAgents((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const toggleAll = () => {
    setVisibleAgents((prev) =>
      prev.size === agents.length
        ? new Set()
        : new Set(agents.map((a) => a.Agent_name))
    )
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      {/* Tab buttons */}
      <div className="flex gap-3 border-b border-slate-800 pb-3 mb-4">
        <button
          onClick={() => setActiveTab('stocks')}
          className={`text-xs font-semibold px-3 py-1 rounded transition ${
            activeTab === 'stocks'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Stock Conditions
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`text-xs font-semibold px-3 py-1 rounded transition ${
            activeTab === 'agents'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Agent Points
        </button>
      </div>

      {/* Chart */}
      {activeTab === 'stocks' ? (
        <StockTrendChart data={stockHistory} />
      ) : (
        <>
          <AgentPointsTrendChart data={agentPointsHistory} visibleAgents={visibleAgents} />
          {/* Checkbox filter */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-700 pt-4">
            <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer hover:text-slate-300">
              <input
                type="checkbox"
                checked={visibleAgents.size === agents.length}
                onChange={toggleAll}
                className="accent-emerald-400"
              />
              All
            </label>
            {agents.map((agent) => (
              <label
                key={agent.Agent_name}
                className="flex items-center gap-1.5 text-xs cursor-pointer hover:text-slate-100"
                style={{ color: colorMap.get(agent.Agent_name) }}
              >
                <input
                  type="checkbox"
                  checked={visibleAgents.has(agent.Agent_name)}
                  onChange={() => toggleAgent(agent.Agent_name)}
                  className="accent-emerald-400"
                />
                {agent.Agent_name}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  )
}