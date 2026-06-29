import { getLook, statusBadge } from '../../lib/agentPresentation'

export interface CitizenCardAgent {
  Agent_name: string
  financial_points: number
  current_asset_allocation?: string
  is_bankrupt: boolean
}

interface CitizenCardProps {
  agent: CitizenCardAgent
  fallbackAllocation?: string
}

export default function CitizenCard({ agent, fallbackAllocation }: CitizenCardProps) {
  const look = getLook(agent.Agent_name)
  const badge = statusBadge(agent.financial_points, agent.is_bankrupt)
  const allocation = agent.current_asset_allocation || fallbackAllocation || 'Exploring the market'

  return (
    <article className="citizen-card group">
      <div className={`avatar-bubble bg-gradient-to-br ${look.color}`}>
        <span className="text-5xl drop-shadow-sm">{look.emoji}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="truncate text-lg font-black text-slate-800">{agent.Agent_name}</h3>
          <span className={`status-badge ${badge.tone}`}>{badge.icon} {badge.label}</span>
        </div>
        <p className="text-xs font-extrabold text-slate-400">{look.mood} • {look.home}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="coin-pill coin-pop">🪙 {agent.financial_points} coins</span>
          <span className="asset-pill">{allocation}</span>
        </div>
      </div>
    </article>
  )
}
