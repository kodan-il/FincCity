import { getLook } from '../../lib/agentPresentation'

export interface DiaryBubbleEntry {
  Agent_name: string
  reasoning: string
  tick: number
  type: 'bankrupt' | 'swing' | 'intervention' | 'bull' | 'bear'
  outcome: number
  market_effect?: string
}

interface DiaryBubbleProps {
  entry: DiaryBubbleEntry
}

export default function DiaryBubble({ entry }: DiaryBubbleProps) {
  const isIntervention = entry.type === 'intervention'
  const isBull = entry.type === 'bull' || entry.market_effect === 'bull_market'
  const isBear = entry.type === 'bear' || entry.market_effect === 'bear_market' || entry.type === 'bankrupt'
  const isSwing = entry.type === 'swing'

  const cardStyle = isIntervention
    ? 'border-amber-300 bg-amber-50/80'
    : isBull
    ? 'border-emerald-300 bg-emerald-50/80'
    : isBear
    ? 'border-red-300 bg-red-50/80'
    : 'border-slate-200 bg-slate-50/80'

  const labelStyle = isIntervention
    ? 'text-amber-600'
    : isBull
    ? 'text-emerald-600'
    : isBear
    ? 'text-red-500'
    : 'text-slate-500'

  const label = isIntervention
    ? '⚡ Market Intervention'
    : isBull
    ? '📈 Bullish Move'
    : entry.type === 'bankrupt'
    ? '💀 Bankrupt'
    : isSwing
    ? '🎲 Big Swing'
    : '📝 Update'

  const look = getLook(entry.Agent_name)

  return (
    <div className={`rounded-[20px] border-2 p-4 transition ${cardStyle}`}>
      <div className="mb-1 flex items-center justify-between">
        <span className={`text-xs font-black uppercase tracking-wide ${labelStyle}`}>
          {label}
        </span>
        <span className="text-xs font-bold text-slate-400">Tick #{entry.tick}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg">{look.emoji}</span>
        <p className="font-black text-slate-700">{entry.Agent_name}</p>
      </div>
      <p className="mt-1 text-sm font-bold text-slate-500">"{entry.reasoning}"</p>
    </div>
  )
}
