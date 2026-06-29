import { getLook } from '../../lib/agentPresentation'

export interface DiaryBubbleEntry {
  Agent_name: string
  reasoning: string
  tick: number
  type: 'bankrupt' | 'swing'
  outcome: number
}

interface DiaryBubbleProps {
  entry: DiaryBubbleEntry
}

export default function DiaryBubble({ entry }: DiaryBubbleProps) {
  const look = getLook(entry.Agent_name)

  return (
    <article className="diary-card">
      <div className="flex items-start gap-3">
        <div className="diary-avatar">{look.emoji}</div>
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-black text-slate-800">{entry.Agent_name}</span>
            <span className="tiny-chip">Tick #{entry.tick}</span>
            <span className={`tiny-chip ${entry.type === 'bankrupt' ? 'chip-danger' : 'chip-amber'}`}>
              {entry.type === 'bankrupt' ? '🚨 Alert' : '⚡ Swing'}
            </span>
          </div>
          <p className="diary-quote">“{entry.reasoning}”</p>
        </div>
      </div>
    </article>
  )
}
