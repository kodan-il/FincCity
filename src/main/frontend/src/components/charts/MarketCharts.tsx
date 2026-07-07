import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface StockTickEntry {
  tick: number
  stocks: { name: string; type: string; trend: string; outcome: number }[]
}

interface AgentPointsEntry {
  tick: number
  points: { agent_name: string; financial_points: number; is_bankrupt: boolean }[]
}

// --- Tab 1: Stock Conditions ---
function StockConditionsChart({ data }: { data: StockTickEntry[] }) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !Array.isArray(data) || data.length === 0) return

    const normalizedData = data.map((entry) => {
      const source = entry as StockTickEntry & { stock?: Array<Record<string, unknown>>; stocks?: Array<Record<string, unknown>> }
      const stocks = Array.isArray(source.stocks)
        ? source.stocks
        : Array.isArray(source.stock)
          ? source.stock
          : []
      return { ...entry, stocks }
    })

    console.debug('[MarketCharts] stock data received', normalizedData)

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth || 400
    const height = 200
    const margin = { top: 16, right: 90, bottom: 32, left: 36 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    const safeData = normalizedData.filter((d) => d && typeof d === 'object')
    const stockNames = Array.from(
      new Set(safeData.flatMap((d) => (Array.isArray(d.stocks) ? d.stocks : []).map((s) => s?.name).filter(Boolean)))
    )

    const allTicks = safeData.map((d) => Number(d.tick)).filter((value) => Number.isFinite(value))
    const allOutcomes = safeData.flatMap((d) => (Array.isArray(d.stocks) ? d.stocks : []).map((s) => Number(s?.outcome)).filter((value) => Number.isFinite(value)))

    const tickMin = allTicks.length > 0 ? d3.min(allTicks)! : 0
    const tickMax = allTicks.length > 0 ? d3.max(allTicks)! : 1
    const outcomeMin = allOutcomes.length > 0 ? d3.min(allOutcomes)! : 0
    const outcomeMax = allOutcomes.length > 0 ? d3.max(allOutcomes)! : 1

    const xScale = d3.scaleLinear()
      .domain([tickMin, tickMax || tickMin + 1])
      .range([0, innerW])

    const yScale = d3.scaleLinear()
      .domain([outcomeMin - 1, outcomeMax + 1])
      .range([innerH, 0])

    const color = d3.scaleOrdinal(d3.schemeTableau10).domain(stockNames)
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // Zero line
    g.append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', yScale(0)).attr('y2', yScale(0))
      .attr('stroke', '#334155')
      .attr('stroke-dasharray', '4,3')

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.format('d')))
      .call((g) => g.select('.domain').attr('stroke', '#475569'))
      .call((g) => g.selectAll('text').attr('fill', '#94a3b8').attr('font-size', 10))

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .call((g) => g.select('.domain').attr('stroke', '#475569'))
      .call((g) => g.selectAll('text').attr('fill', '#94a3b8').attr('font-size', 10))

    // Lines per stock
    const line = d3.line<{ tick: number; outcome: number }>()
      .x((d) => xScale(d.tick))
      .y((d) => yScale(d.outcome))
      .curve(d3.curveMonotoneX)

    stockNames.forEach((name) => {
      const values = safeData
        .map((d) => {
          const stocks = Array.isArray(d.stocks) ? d.stocks : []
          const found = stocks.find((s) => s?.name === name)
          return found ? { tick: d.tick, outcome: found.outcome } : null
        })
        .filter(Boolean) as { tick: number; outcome: number }[]

      g.append('path')
        .datum(values)
        .attr('fill', 'none')
        .attr('stroke', color(name) as string)
        .attr('stroke-width', 2)
        .attr('d', line)

      if (values.length > 0) {
        const last = values[values.length - 1]
        g.append('text')
          .attr('x', xScale(last.tick) + 6)
          .attr('y', yScale(last.outcome) + 4)
          .attr('fill', color(name) as string)
          .attr('font-size', 9)
          .text(name.length > 14 ? name.slice(0, 14) + '…' : name)
      }
    })
  }, [data])

  if (data.length === 0) {
    return <p className="text-xs text-slate-500 italic">Start simulation to see stock conditions...</p>
  }

  return <svg ref={svgRef} className="w-full" height={200} />
}

// --- Tab 2: Agent Points ---
function AgentPointsChart({
  data,
  visibleAgents,
}: {
  data: AgentPointsEntry[]
  visibleAgents: Set<string>
}) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !Array.isArray(data) || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth || 400
    const height = 200
    const margin = { top: 16, right: 16, bottom: 32, left: 36 }
    const innerW = width - margin.left - margin.right
    const innerH = height - margin.top - margin.bottom

    const safeData = data.filter((d) => d && typeof d === 'object')
    const allAgents = Array.from(
      new Set(safeData.flatMap((d) => (Array.isArray(d.points) ? d.points : []).map((p) => p?.agent_name).filter(Boolean)))
    ).filter((name) => visibleAgents.has(name))

    const allTicks = safeData.map((d) => Number(d.tick)).filter((value) => Number.isFinite(value))
    const allPoints = safeData.flatMap((d) =>
      (Array.isArray(d.points) ? d.points : [])
        .filter((p) => visibleAgents.has(p?.agent_name))
        .map((p) => Number(p?.financial_points))
        .filter((value) => Number.isFinite(value))
    )

    if (allPoints.length === 0) return

    const tickMin = allTicks.length > 0 ? d3.min(allTicks)! : 0
    const tickMax = allTicks.length > 0 ? d3.max(allTicks)! : 1
    const pointMax = d3.max(allPoints) ?? 1

    const xScale = d3.scaleLinear()
      .domain([tickMin, tickMax || tickMin + 1])
      .range([0, innerW])

    const yScale = d3.scaleLinear()
      .domain([0, pointMax + 2])
      .range([innerH, 0])

    const color = d3.scaleOrdinal(d3.schemeTableau10).domain(allAgents)
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.format('d')))
      .call((g) => g.select('.domain').attr('stroke', '#475569'))
      .call((g) => g.selectAll('text').attr('fill', '#94a3b8').attr('font-size', 10))

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .call((g) => g.select('.domain').attr('stroke', '#475569'))
      .call((g) => g.selectAll('text').attr('fill', '#94a3b8').attr('font-size', 10))

    const line = d3.line<{ tick: number; financial_points: number }>()
      .x((d) => xScale(d.tick))
      .y((d) => yScale(d.financial_points))
      .curve(d3.curveMonotoneX)

    allAgents.forEach((agentName) => {
      const agentData = safeData.map((d) => {
        const points = Array.isArray(d.points) ? d.points : []
        const found = points.find((p) => p?.agent_name === agentName)
        return found ? { tick: d.tick, financial_points: found.financial_points } : null
      }).filter(Boolean) as { tick: number; financial_points: number }[]

      g.append('path')
        .datum(agentData)
        .attr('fill', 'none')
        .attr('stroke', color(agentName) as string)
        .attr('stroke-width', 2)
        .attr('d', line)
    })
  }, [data, visibleAgents])

  if (data.length === 0) {
    return <p className="text-xs text-slate-500 italic">Start simulation to see agent points...</p>
  }

  return <svg ref={svgRef} className="w-full" height={200} />
}

// --- Main Export ---
export default function MarketChart({
  stockHistory,
  agentPointsHistory,
  agents,
}: {
  stockHistory: StockTickEntry[]
  agentPointsHistory: AgentPointsEntry[]
  agents: { Agent_name: string }[]
}) {
  const [activeTab, setActiveTab]       = useState<'stocks' | 'agents'>('stocks')
  const [visibleAgents, setVisibleAgents] = useState<Set<string>>(
    new Set(agents.map((a) => a.Agent_name))
  )

  const color = d3.scaleOrdinal(d3.schemeTableau10)
    .domain(agents.map((a) => a.Agent_name))

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
    <div className="bet-form-card mt-4">
      {/* Tab buttons */}
      <div className="flex gap-3 border-b border-slate-800 pb-3 mb-4">
        <button
          onClick={() => setActiveTab('stocks')}
          className={`text-xs font-semibold px-3 py-1 rounded transition ${
            activeTab === 'stocks'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-1000 hover:text-slate-250'
          }`}
        >
          Stock Conditions
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`text-xs font-semibold px-3 py-1 rounded transition ${
            activeTab === 'agents'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-1000 hover:text-slate-250'
          }`}
        >
          Agent Points
        </button>
      </div>

      {/* Chart */}
      {activeTab === 'stocks' ? (
        <StockConditionsChart data={stockHistory} />
      ) : (
        <>
          <AgentPointsChart data={agentPointsHistory} visibleAgents={visibleAgents} />
          {/* Checkbox filter */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
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
                className="flex items-center gap-1.5 text-xs cursor-pointer"
                style={{ color: color(agent.Agent_name) as string }}
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