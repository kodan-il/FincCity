import RibbonTitle from '../ui/RibbonTitle'

export default function MarketPlaceholder() {
  return (
    <section className="cartoon-panel market-placeholder flex min-h-[320px] flex-col items-center justify-center p-5 text-center">
      <RibbonTitle tone="green">📈 Market chart</RibbonTitle>
      <div className="mt-8 text-7xl">📊</div>
      <h2 className="mt-4 text-2xl font-black text-slate-800">Chart coming next</h2>
      <p className="mt-2 max-w-md text-sm font-bold text-slate-500">
        This cheerful area is ready for the real-time visualization later. For now, it keeps the dashboard balanced and playful.
      </p>
      <div className="mt-6 grid w-full max-w-lg grid-cols-4 gap-3">
        {[30, 55, 42, 72].map((height, idx) => (
          <div key={idx} className="flex h-28 items-end rounded-3xl bg-white/70 p-2 shadow-inner">
            <div className="w-full rounded-2xl bg-gradient-to-t from-teal-300 to-emerald-300 chart-bar" style={{ height: `${height}%` }} />
          </div>
        ))}
      </div>
    </section>
  )
}
