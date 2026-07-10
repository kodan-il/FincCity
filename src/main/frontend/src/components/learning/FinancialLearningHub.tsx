import { useEffect, useMemo, useState } from 'react'
import RibbonTitle from '../ui/RibbonTitle'
import MarketNewsEvents, { type MarketEvent, type DiaryEntry } from './MarketNewsEvents'

const API_BASE = 'http://127.0.0.1:8000/api'

type MarketMetric = {
  label: string
  value: string | number
  change: string
  icon: string
  tone: string
  bars?: number[]
}
type AgentSnapshot = {
  Agent_name: string
  financial_points: number
  current_asset_allocation: string
  is_bankrupt: boolean
}

type AgentPointHistoryItem = {
  tick: number
  points: {
    agent_name: string
    financial_points: number
    is_bankrupt: boolean
  }[]
}

type LiveStock = {
  name: string
  type: 'stable' | 'high_volatile'
  trend: 'bull' | 'bear'
  outcome: number
}

type StockHistoryTick = {
  tick: number
  stocks: LiveStock[]
}

type LiveState = {
  current_tick: number
  current_month: number
  market_condition: string
  market_metrics?: MarketMetric[]
  market_event?: MarketEvent | null
  market_events?: MarketEvent[]
  diary_entries?: DiaryEntry[]
  agent_snapshots?: AgentSnapshot[]
  agent_points_history?: AgentPointHistoryItem[]
  stock_history?: StockHistoryTick[]
}



const marketMetrics = [
  { label: 'Market Index', value: '1,245.6', change: '+2.45%', icon: '📈', tone: 'green', bars: [30, 42, 38, 55, 49, 70, 76] },
  { label: 'Inflation', value: '2.4%', change: '-0.10%', icon: '💸', tone: 'amber', bars: [42, 36, 44, 39, 50, 48, 41] },
  { label: 'Interest Rate', value: '4.0%', change: '0.00%', icon: '🏦', tone: 'blue', bars: [35, 35, 36, 35, 36, 35, 35] },
  { label: 'Volatility', value: '18.6 VIX', change: '+1.80%', icon: '⚡', tone: 'red', bars: [46, 38, 60, 44, 62, 50, 57] },
  { label: 'Investor Confidence', value: 'High', change: '+1.8%', icon: '😊', tone: 'green', bars: [35, 45, 58, 54, 62, 76, 80] },
]

const assetMetadata = [
  { icon: '💻', name: 'Technology Stock', type: 'Growth asset', risk: 4, returnPotential: 5, volatility: 4, trend: 'Rising', change: '+4.32%', lesson: 'Technology stocks can grow quickly, but prices often swing when investors react to news or earnings.' },
  { icon: '🏦', name: 'Banking Stock', type: 'Financial sector', risk: 2, returnPotential: 3, volatility: 2, trend: 'Stable', change: '+1.23%', lesson: 'Banks may benefit from higher interest rates, but they can suffer when the economy weakens.' },
  { icon: '🚗', name: 'Automobile Stock', type: 'Cyclical asset', risk: 3, returnPotential: 3, volatility: 3, trend: 'Stable', change: '+0.88%', lesson: 'Auto stocks often depend on consumer spending, fuel prices, and the broader economic cycle.' },
  { icon: '🛢️', name: 'Petroleum Stock', type: 'Energy sector', risk: 3, returnPotential: 4, volatility: 4, trend: 'Rising', change: '+2.17%', lesson: 'Energy stocks are strongly influenced by oil prices, supply shocks, and global demand.' },
  { icon: '🚀', name: 'Start-Up Stock', type: 'Speculative growth', risk: 5, returnPotential: 5, volatility: 5, trend: 'Unstable', change: '-0.45%', lesson: 'Start-ups may offer high growth, but many fail. This is a classic high-risk, high-reward choice.' },
  { icon: '🐶', name: 'Doge Coin', type: 'Cryptocurrency', risk: 5, returnPotential: 5, volatility: 5, trend: 'Falling', change: '-1.32%', lesson: 'Speculative crypto assets can move sharply because of hype, sentiment, and low predictability.' },
  { icon: '🎮', name: 'Online Game Company', type: 'Trend-driven asset', risk: 4, returnPotential: 4, volatility: 4, trend: 'Rising', change: '+1.78%', lesson: 'Gaming companies can rise with popular releases, but revenue may drop if user attention shifts.' },
  { icon: '🏥', name: 'Healthcare Stock', type: 'Defensive sector', risk: 2, returnPotential: 3, volatility: 2, trend: 'Stable', change: '+0.65%', lesson: 'Healthcare often stays resilient because demand for medical services is less tied to the economy.' },
]

const concepts = [
  { title: 'Diversification', icon: '🛡️', text: 'Spreading investments across different assets to reduce the impact of one poor performer.', example: 'A citizen holding tech, banking and cash is less exposed to one bad sector.' },
  { title: 'Volatility', icon: '⚡', text: 'How much an asset price moves up and down. Higher volatility means higher uncertainty.', example: 'Doge Coin may jump quickly but can also cause sharp losses.' },
  { title: 'Risk vs Reward', icon: '🎯', text: 'Investments with higher possible returns usually come with higher chances of loss.', example: 'Start-Up Stock can create big wins, but it is also one of the riskiest choices.' },
  { title: 'Inflation', icon: '💸', text: 'When prices rise over time, money loses purchasing power, affecting savings and investments.', example: 'High inflation can make investors cautious and change asset demand.' },
  { title: 'Interest Rate', icon: '🏦', text: 'The cost of borrowing money. Higher rates can slow growth but may support banks.', example: 'A rate hike may hurt growth stocks while making banking stocks attractive.' },
  { title: 'Investor Sentiment', icon: '😊', text: 'The general mood of investors. Optimism can push prices up; fear can push them down.', example: 'In a bear market, even good assets may face selling pressure.' },
]

const portfolios = [
  { name: 'Bryan', avatar: '👦🏻', diversity: 'Good', coins: 13, parts: [45, 20, 15, 20], profit: '+3', style: 'Curious saver' },
  { name: 'Bernard', avatar: '🧑🏾‍💼', diversity: 'Average', coins: 21, parts: [30, 30, 20, 20], profit: '+11', style: 'Careful planner' },
  { name: 'Barbara', avatar: '👩🏾', diversity: 'Good', coins: 18, parts: [30, 25, 15, 30], profit: '+8', style: 'Trend watcher' },
  { name: 'Eriko', avatar: '👩🏼‍💻', diversity: 'Average', coins: 16, parts: [25, 25, 20, 30], profit: '+6', style: 'Market dreamer' },
  { name: 'Lucius', avatar: '😎', diversity: 'Low', coins: 13, parts: [60, 10, 20, 10], profit: '+3', style: 'Bold mover' },
  { name: 'Michelle', avatar: '👩🏻‍💼', diversity: 'Good', coins: 20, parts: [35, 30, 15, 20], profit: '+10', style: 'Stable strategist' },
]

const agentPerformance = [
  { name: 'Bernard', coins: 21, gain: 11, risk: 'Medium', series: [10, 12, 14, 13, 17, 21] },
  { name: 'Michelle', coins: 20, gain: 10, risk: 'Low', series: [10, 12, 13, 15, 18, 20] },
  { name: 'Barbara', coins: 18, gain: 8, risk: 'Medium', series: [10, 11, 13, 15, 16, 18] },
  { name: 'Eriko', coins: 16, gain: 6, risk: 'Medium', series: [10, 9, 11, 13, 15, 16] },
  { name: 'Lucius', coins: 13, gain: 3, risk: 'High', series: [10, 14, 9, 16, 11, 13] },
  { name: 'Bryan', coins: 0, gain: -10, risk: 'High', series: [10, 8, 12, 6, 4, 0] },
]

const trendPoints = [34, 42, 39, 55, 51, 62, 58, 71, 68, 78, 74, 86]

type HubTab = 'overview' | 'news' | 'assets' | 'concepts' | 'portfolios' | 'analytics'

const tabs: { id: HubTab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Market Overview', icon: '🌍' },
  { id: 'news', label: 'News & Events', icon: '📰' },
  { id: 'assets', label: 'Assets Library', icon: '💼' },
  { id: 'concepts', label: 'Learn Finance', icon: '📖' },
  { id: 'portfolios', label: 'Agent Portfolios', icon: '🧑‍🤝‍🧑' },
  { id: 'analytics', label: 'Performance', icon: '📈' },
]

function Dots({ value, max = 5, danger = false }: { value: number; max?: number; danger?: boolean }) {
  return (
    <div className="rating-dots" aria-label={`${value} out of ${max}`}>
      {Array.from({ length: max }).map((_, idx) => (
        <span key={idx} className={idx < value ? (danger ? 'dot-on-danger' : 'dot-on') : 'dot-off'} />
      ))}
    </div>
  )
}

function MiniSparkline({ values }: { values: number[] }) {
  const points = values.map((value, idx) => `${(idx / (values.length - 1)) * 100},${100 - value}`).join(' ')
  return (
    <svg className="mini-sparkline" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrendChart({
  values,
  label,
  condition,
}: {
  values: number[]
  label: string | number
  condition: string
}) {
  const safeValues = values.length >= 2 ? values : [34, 42, 39, 55, 51, 62, 58, 71]

  const points = safeValues
    .map((value, idx) => `${(idx / (safeValues.length - 1)) * 100},${100 - value}`)
    .join(' ')

  const lineColor =
    condition === 'bear_market'
      ? '#ef4444'
      : condition === 'bull_market'
        ? '#10b981'
        : '#3b82f6'

  return (
    <div className="learning-chart-card">
      <div className="chart-grid-lines" />

      <svg className="learning-trend-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.32" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        <polygon points={`0,100 ${points} 100,100`} fill="url(#trendFill)" />

        <polyline
          points={points}
          fill="none"
          stroke={lineColor}
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {safeValues.map((value, idx) => (
          <circle
            key={idx}
            cx={(idx / (safeValues.length - 1)) * 100}
            cy={100 - value}
            r="1.8"
            fill={lineColor}
          />
        ))}
      </svg>

      <div className="trend-label trend-label-final">{label}</div>
    </div>
  )
}

type AssetView = {
  icon: string
  name: string
  type: string
  risk: number
  returnPotential: number
  volatility: number
  trend: string
  change: string
  lesson: string
  isLive: boolean
}

function AssetCard({ asset }: { asset: AssetView }) {
  return (
    <article className="learning-card asset-card">
      <div className="asset-card-header">
        <span className="asset-icon">{asset.icon}</span>
        <div>
          <h3>{asset.name}</h3>
          <p>{asset.type}</p>
        </div>
      </div>
      <div className="asset-rating-row"><span>Risk</span><Dots value={asset.risk} danger={asset.risk >= 4} /></div>
      <div className="asset-rating-row"><span>Return</span><Dots value={asset.returnPotential} /></div>
      <div className="asset-rating-row"><span>Volatility</span><Dots value={asset.volatility} danger={asset.volatility >= 4} /></div>
      <div className={`asset-trend-pill ${asset.change.startsWith('-') ? 'trend-negative' : 'trend-positive'}`}>
        {asset.trend} {asset.change}
      </div>
      <p className="asset-lesson">{asset.lesson}</p>
    </article>
  )
}

function PortfolioBar({ parts }: { parts: number[] }) {
  return (
    <div className="portfolio-bar" aria-label="Portfolio allocation">
      {parts.map((value, index) => (
        <span key={`${value}-${index}`} style={{ width: `${value}%` }} className={`portfolio-slice slice-${index}`}>
          {value}%
        </span>
      ))}
    </div>
  )
}

function SideRail({ setTab }: { setTab: (tab: HubTab) => void }) {
  return (
    <aside className="learning-side-stack">
      <section className="learning-card concept-day-card">
        <RibbonTitle tone="purple">💡 Concept of the Day</RibbonTitle>
        <div className="concept-day-body">
          <span>🛡️</span>
          <h3>Diversification</h3>
          <p>Diversification means spreading investments across different assets to reduce risk.</p>
          <strong>Why it matters</strong>
          <p>If one investment performs poorly, other assets may help protect the overall portfolio.</p>
        </div>
      </section>

      <section className="learning-card compact-news-card">
        <div className="flex items-center justify-between gap-2">
          <RibbonTitle tone="amber">📰 Market News</RibbonTitle>
          <button className="learning-link-button" onClick={() => setTab('news')}>View all</button>
        </div>
        <div className="event-list mt-4">
          {['Tech earnings beat expectations', 'Oil prices surge', 'Central bank raises rates'].map((title, idx) => (
            <article key={title} className="compact-event-row">
              <span className="event-time">{[2, 5, 8][idx]} ticks ago</span>
              <h3>{title}</h3>
              <p>{idx === 0 ? 'Large tech firms reported stronger profits.' : idx === 1 ? 'Energy prices increased after supply concerns.' : 'Higher rates can reduce risk appetite.'}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="learning-card learning-nudge-card">
        <span className="text-4xl">🎓</span>
        <div>
          <h3>Keep learning, keep growing!</h3>
          <p>Connect each simulation result to one market concept.</p>
        </div>
      </section>
    </aside>
  )
}

function getPortfolioParts(assetName: string) {
  if (!assetName) return [25, 25, 25, 25]

  const asset = assetName.toLowerCase()

  if (asset.includes('technology') || asset.includes('tech') || asset.includes('game')) {
    return [70, 10, 10, 10]
  }

  if (asset.includes('bank')) {
    return [10, 70, 10, 10]
  }

  if (asset.includes('petroleum') || asset.includes('oil') || asset.includes('energy')) {
    return [10, 10, 70, 10]
  }

  return [40, 20, 20, 20]
}

export default function FinancialLearningHub() {
  const [activeTab, setActiveTab] = useState<HubTab>('overview')
  const [liveState, setLiveState] = useState<LiveState | null>(null)
  const visibleAssets = useMemo(() => {
    const history = liveState?.stock_history ?? []

    return assetMetadata.map((metadata) => {
      const assetHistory = history
        .flatMap((entry) =>
          entry.stocks.map((stock) => ({
            ...stock,
            tick: entry.tick,
          }))
        )
        .filter((stock) => stock.name === metadata.name)

      const latest = assetHistory.at(-1)

      const recentHistory = assetHistory.slice(-5)

      const averageOutcome =
        recentHistory.length > 0
          ? recentHistory.reduce((sum, stock) => sum + stock.outcome, 0) /
          recentHistory.length
          : 0

      const averageMovement =
        recentHistory.length > 0
          ? recentHistory.reduce(
            (sum, stock) => sum + Math.abs(stock.outcome),
            0
          ) / recentHistory.length
          : 0

      const returnPotential = Math.max(
        1,
        Math.min(5, Math.round(3 + averageOutcome / 2))
      )

      const volatility = Math.max(
        1,
        Math.min(
          5,
          Math.round(
            metadata.baseRisk +
            averageMovement / 2 +
            (latest?.type === 'high_volatile' ? 1 : 0)
          )
        )
      )

      const risk = Math.max(
        1,
        Math.min(
          5,
          latest?.type === 'high_volatile'
            ? Math.max(4, metadata.baseRisk)
            : metadata.baseRisk
        )
      )

      const outcome = latest?.outcome ?? 0

      const trend =
        outcome > 0 ? 'Rising' : outcome < 0 ? 'Falling' : 'Stable'

      const change = `${outcome >= 0 ? '+' : ''}${outcome.toFixed(2)}%`

      return {
        icon: metadata.icon,
        name: metadata.displayName ?? metadata.name,
        type: metadata.type,
        risk,
        returnPotential,
        volatility,
        trend,
        change,
        lesson: metadata.lesson,
        isLive: Boolean(latest),
      }
    })
  }, [liveState?.stock_history])

  useEffect(() => {
    const fetchLiveState = async () => {
      try {
        const res = await fetch(`${API_BASE}/simulation/live-state`)
        if (!res.ok) return
        const data: LiveState = await res.json()
        setLiveState(data)
      } catch {
        // Keep the learning hub available before the backend starts.
      }
    }
    fetchLiveState()
    const interval = setInterval(fetchLiveState, 1600)
    return () => clearInterval(interval)
  }, [])

  const rawMarketCondition = liveState?.market_condition || 'normal'

  const marketConditionView =
    rawMarketCondition === 'bull_market'
      ? {
        label: 'bull market',
        icon: '🐂',
        trendIcon: '📈',
        copy: 'Investors are optimistic and most assets are showing positive momentum. In a bullish market, growth assets may perform better, but high returns still come with high risk.',
        tip: '💡 Growth stocks tend to rise in bullish markets, while defensive assets usually offer stability.',
      }
      : rawMarketCondition === 'bear_market'
        ? {
          label: 'bear market',
          icon: '🐻',
          trendIcon: '📉',
          copy: 'Investors are cautious and many assets are under pressure. In a bearish market, defensive assets may become safer choices.',
          tip: '💡 Defensive assets usually become more attractive in bearish markets, while risky assets may fall harder.',
        }
        : {
          label: rawMarketCondition.replaceAll('_', ' '),
          icon: '⚖️',
          trendIcon: '➖',
          copy: 'The market is stable with no major upward or downward movement. Balanced strategies may work better here.',
          tip: '💡 In stable markets, diversified portfolios usually perform better than extreme risky bets.',
        }

  const liveMarketMetrics = liveState?.market_metrics?.length
    ? liveState.market_metrics
    : marketMetrics

  const livePortfolios = liveState?.agent_snapshots?.length
    ? liveState.agent_snapshots.map((agent) => {
      const coins = agent.financial_points
      const profit = coins - 10

      return {
        name: agent.Agent_name,
        avatar: agent.is_bankrupt ? '💀' : '👤',
        diversity: agent.current_asset_allocation ? 'Active' : 'Unknown',
        coins,
        parts: getPortfolioParts(agent.current_asset_allocation),
        profit: profit >= 0 ? `+${profit}` : `${profit}`,
        style: agent.current_asset_allocation || 'No asset selected',
        is_bankrupt: agent.is_bankrupt,
      }
    })
    : portfolios

  const liveAgentPerformance = liveState?.agent_snapshots?.length
    ? liveState.agent_snapshots
      .map((agent) => {
        const coins = agent.financial_points
        const gain = coins - 10

        return {
          name: agent.Agent_name,
          coins,
          gain,
          risk: agent.is_bankrupt ? 'Bankrupt' : gain < 0 ? 'High' : gain < 8 ? 'Medium' : 'Low',
        }
      })
      .sort((a, b) => b.coins - a.coins)
    : agentPerformance

  const liveTrendPoints =
    liveState?.agent_points_history?.length
      ? liveState.agent_points_history.map((entry) => {
        const activeAgents = entry.points.filter((p) => !p.is_bankrupt)
        const avg =
          activeAgents.length > 0
            ? activeAgents.reduce((sum, p) => sum + p.financial_points, 0) / activeAgents.length
            : 0

        return Math.min(90, Math.max(10, avg * 4))
      })
      : trendPoints

  const latestMarketIndex =
    liveState?.market_metrics?.find((metric) => metric.label === 'Market Index')?.value || '1,245.6'

  const losingAgents = liveAgentPerformance.filter((agent) => agent.gain < 0).length
  const bankruptAgents = liveAgentPerformance.filter((agent) => agent.risk === 'Bankrupt').length

  const marketRiskBase =
    rawMarketCondition === 'bear_market' ? 55 :
      rawMarketCondition === 'bull_market' ? 35 :
        25

  const liveRiskScore = Math.min(
    95,
    marketRiskBase + losingAgents * 6 + bankruptAgents * 12
  )

  const liveRiskLabel =
    liveRiskScore >= 75 ? 'High Risk' :
      liveRiskScore >= 50 ? 'Medium Risk' :
        'Balanced Risk'

  const liveRiskText =
    liveRiskScore >= 75
      ? 'Several agents are under pressure. Safer assets and diversification matter most right now.'
      : liveRiskScore >= 50
        ? 'The market has opportunities, but some agents are exposed to losses. Avoid putting everything into one risky asset.'
        : 'The market looks relatively calm. Balanced portfolios are currently safer than extreme bets.'


  return (
    <div className="learning-page h-full min-h-0 overflow-y-auto p-4 xl:p-6">
      <section className="cartoon-panel learning-hero p-5">
        <div>
          <div className="learning-title-line">
            <span className="learning-title-icon">🎓</span>
            <div>
              <h2>Financial Learning Hub</h2>
              <p>Learn financial concepts, understand the market, and make smarter predictions.</p>
            </div>
          </div>

          <div className="learning-tabs" role="tablist">
            {tabs.map((tab) => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`learning-tab ${activeTab === tab.id ? 'learning-tab-active' : ''}`}>
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="learning-welcome-card">
          <div className="text-6xl">🐶</div>
          <div>
            <h3>Welcome back, Mayor Pup!</h3>
            <p>Explore the market, learn key concepts, and connect every simulation result to financial literacy.</p>
          </div>
        </div>
      </section>

      <div className="learning-layout mt-5">
        <section className="cartoon-panel learning-main-panel p-5">
          {activeTab === 'news' ? (
            <MarketNewsEvents embedded liveState={liveState} />
          ) : (
            <>
              <div className="learning-panel-heading">
                <RibbonTitle tone="green">
                  {activeTab === 'overview' && '📈 Market Overview'}
                  {activeTab === 'assets' && '💼 Investment Assets'}
                  {activeTab === 'concepts' && '📖 Learn Finance'}
                  {activeTab === 'portfolios' && '🧑‍🤝‍🧑 Agent Portfolios'}
                  {activeTab === 'analytics' && '📈 Performance Analytics'}
                </RibbonTitle>
                <p>
                  {activeTab === 'overview' && 'Understand the current economic environment and how it affects decisions.'}
                  {activeTab === 'assets' && 'Compare risk, volatility, and return potential across simulated assets.'}
                  {activeTab === 'concepts' && 'Simple definitions with FinnCity examples, not textbook jargon.'}
                  {activeTab === 'portfolios' && 'See how all citizens spread investments across different assets.'}
                  {activeTab === 'analytics' && 'Use performance visuals to understand profit, loss, and market movement.'}
                </p>
              </div>

              {activeTab === 'overview' && (
                <div className="learning-overview-grid">
                  <div className="market-condition-card">
                    <div className="market-condition-top">
                      <span className="text-6xl">{marketConditionView.icon}</span>
                      <div>
                        <p>Current Market Condition</p>
                        <h3>{marketConditionView.label}</h3>
                      </div>
                      <span className="text-4xl">{marketConditionView.trendIcon}</span>
                    </div>
                    <p className="market-condition-copy">{marketConditionView.copy}</p>
                    <div className="market-condition-tip">{marketConditionView.tip}</div>
                  </div>

                  <div className="metric-grid">
                    {liveMarketMetrics.map((metric) => (
                      <div key={metric.label} className={`metric-card metric-${metric.tone}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-2xl">{metric.icon}</span>
                          <span className="metric-change">{metric.change}</span>
                        </div>
                        <p>{metric.label}</p>
                        <h4>{metric.value}</h4>
                        <MiniSparkline values={metric.bars || [35, 45, 55, 50, 60, 65, 70]} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'assets' && (
                <div className="asset-library-grid">
                  {visibleAssets.map((asset) => <AssetCard key={asset.name} asset={asset} />)}
                </div>
              )}

              {activeTab === 'concepts' && (
                <div className="concept-grid">
                  {concepts.map((concept) => (
                    <article key={concept.title} className="learning-card concept-card">
                      <span>{concept.icon}</span>
                      <h3>{concept.title}</h3>
                      <p>{concept.text}</p>
                      <div className="concept-example">Example in FinnCity: {concept.example}</div>
                    </article>
                  ))}
                </div>
              )}

              {activeTab === 'portfolios' && (
                <div className="portfolio-list">
                  {livePortfolios.map((portfolio) => (
                    <article key={portfolio.name} className="portfolio-row-card">
                      <div className="portfolio-name"><span>{portfolio.avatar}</span><strong>{portfolio.name}</strong><small>{portfolio.style} • {portfolio.coins} coins</small></div>
                      <PortfolioBar parts={portfolio.parts} />
                      <div className={`diversification-pill ${portfolio.diversity === 'Good' ? 'good' : portfolio.diversity === 'Low' ? 'bad' : 'average'}`}>{portfolio.diversity} diversification</div>
                      <div className={portfolio.profit.startsWith('-') ? 'profit-negative' : 'profit-positive'}>{portfolio.profit}</div>
                    </article>
                  ))}
                  <div className="portfolio-legend">
                    <span><b className="slice-dot slice-0" />Technology</span>
                    <span><b className="slice-dot slice-1" />Banking</span>
                    <span><b className="slice-dot slice-2" />Energy</span>
                    <span><b className="slice-dot slice-3" />Cash</span>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="analytics-grid">
                  <div className="analytics-card wide">
                    <div className="analytics-card-heading"><h3>Market Index Trend</h3><span>Last {liveTrendPoints.length} ticks</span></div>
                    <TrendChart values={liveTrendPoints} label={latestMarketIndex} condition={rawMarketCondition} />
                  </div>
                  <div className="analytics-card risk-meter-card">
                    <div className="analytics-card-heading">
                      <h3>Risk Meter</h3>
                      <span>Live risk score: {liveRiskScore}/100</span>
                    </div>

                    <div className="risk-score-pill">
                      {liveRiskLabel}
                    </div>

                    <div className="risk-gauge">
                      <span style={{ width: `${liveRiskScore}%` }} />
                    </div>

                    <div className="risk-scale-row">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>

                    <p className="risk-meter-text">{liveRiskText}</p>
                  </div>
                  <div className="analytics-card wide">
                    <div className="analytics-card-heading"><h3>Agent Profit / Loss</h3><span>Current simulation snapshot</span></div>
                    <div className="agent-performance-list">
                      {liveAgentPerformance.map((agent) => (
                        <div key={agent.name} className="agent-performance-row">
                          <div>
                            <strong>{agent.name}</strong>
                            <span>{agent.coins} coins • {agent.risk} risk</span>
                          </div>
                          <div className="performance-bar">
                            <span style={{ width: `${Math.max(8, Math.min(100, (agent.coins / 60) * 100))}%` }} />
                          </div>
                          <b className={agent.gain >= 0 ? 'profit-positive' : 'profit-negative'}>{agent.gain >= 0 ? '+' : ''}{agent.gain}</b>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="analytics-card">
                    <div className="analytics-card-heading"><h3>Learning Summary</h3><span>What to notice</span></div>
                    <ul className="analytics-lessons">
                      <li>Higher returns usually required higher risk.</li>
                      <li>Diversified agents lose less during unstable markets.</li>
                      <li>Market news explains why assets rise or fall.</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <SideRail setTab={setActiveTab} />
      </div>
    </div>
  )
}
