export interface AgentLook {
  emoji: string
  color: string
  mood: string
  home: string
}

export const agentLooks: Record<string, AgentLook> = {
  Bryan: { emoji: '🧒🏻', color: 'from-sky-200 to-blue-300', mood: 'Curious saver', home: 'Blueberry Lane' },
  Bernard: { emoji: '👨🏾‍💼', color: 'from-violet-200 to-purple-300', mood: 'Careful planner', home: 'Ledger Street' },
  Barbara: { emoji: '👩🏽‍🦱', color: 'from-pink-200 to-rose-300', mood: 'Trend watcher', home: 'Market Square' },
  Richard: { emoji: '👨🏻‍🏫', color: 'from-indigo-200 to-blue-300', mood: 'Number cruncher', home: 'Compass Court' },
  Eriko: { emoji: '👩🏼‍💻', color: 'from-orange-200 to-amber-300', mood: 'Market dreamer', home: 'Pixel Pier' },
  Lauren: { emoji: '👩🏻‍🎨', color: 'from-emerald-200 to-teal-300', mood: 'Future focused', home: 'Garden Row' },
  Micah: { emoji: '🎧', color: 'from-cyan-200 to-sky-300', mood: 'Chill investor', home: 'Lo-fi Loft' },
  Lucius: { emoji: '😎', color: 'from-lime-200 to-green-300', mood: 'Bold mover', home: 'Rocket Road' },
  Anne: { emoji: '👩🏽‍🚀', color: 'from-amber-200 to-orange-300', mood: 'Risk explorer', home: 'Orbit Avenue' },
  Michelle: { emoji: '👩🏻‍💼', color: 'from-fuchsia-200 to-purple-300', mood: 'Stable strategist', home: 'Harbor House' },
}

export function getLook(name: string): AgentLook {
  return agentLooks[name] ?? { emoji: '🙂', color: 'from-slate-200 to-slate-300', mood: 'Citizen', home: 'FinnCity' }
}

export function statusBadge(financialPoints: number, isBankrupt: boolean) {
  if (isBankrupt) return { label: 'Needs help', icon: '🚑', tone: 'badge-danger' }
  if (financialPoints >= 40) return { label: 'Thriving', icon: '🌟', tone: 'badge-success' }
  if (financialPoints >= 20) return { label: 'Growing', icon: '🌱', tone: 'badge-info' }
  return { label: 'Learning', icon: '📚', tone: 'badge-warning' }
}

export function formatTick(tick?: number) {
  return `#${String(tick ?? 12).padStart(3, '0')}`
}
