import RibbonTitle from '../ui/RibbonTitle'
import { getLook } from '../../lib/agentPresentation'
import type { CitizenCardAgent } from '../citizens/CitizenCard'

interface LeaderboardPanelProps {
  agents: CitizenCardAgent[]
  tick?: number
}

export default function LeaderboardPanel({ agents, tick }: LeaderboardPanelProps) {
  return (
    <section className="cartoon-panel p-5">
      <RibbonTitle tone="purple">🏆 Leaderboard {tick ? `(Tick ${tick})` : ''}</RibbonTitle>
      <ol className="mt-5 grid gap-3">
        {agents.map((agent, idx) => {
          const look = getLook(agent.Agent_name)
          const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`
          return (
            <li key={agent.Agent_name} className="leader-row">
              <div className="flex items-center gap-3">
                <span className="w-9 text-center text-xl font-black">{medal}</span>
                <span className="leader-avatar">{look.emoji}</span>
                <span className="font-black text-slate-700">{agent.Agent_name}</span>
              </div>
              <span className="coin-pill coin-pop">🪙 {agent.financial_points}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
