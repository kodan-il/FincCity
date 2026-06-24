import { useState, useEffect } from 'react'
import SimulationDashboard from './components/SimulationDashboard.tsx'
import AgentManagement from './components/AgentManagement.tsx'

type ViewMode = 'dashboard' | 'management';

export default function App(){
    const [viewMode, setViewMode] = useState<ViewMode>('dashboard');

    return(
        <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-200">
            <aside className="flex w-20 flex-col items-center justify-between border-r border-slate-800 bg-slate-900 py-6">
                <div className="flex flex-col items-center gap-6">
                    <button
                        onClick={() => setViewMode('dashboard')}
                        className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
                          viewMode === 'dashboard'
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg'
                            : 'bg-slate-800 text-slate-500 border-slate-700/60 hover:text-white'
                        }`}
                        title="Simulation Dashboard"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </button>

                    <button
                        onClick={() => setViewMode('management')}
                        className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
                          viewMode === 'management'
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg'
                            : 'bg-slate-800 text-slate-500 border-slate-700/60 hover:text-white'
                        }`}
                        title="Agent Configuration Panel"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </button>

                    {/* Information button (Static) */}
                    <button className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-500 border border-slate-700/60">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>
                </div>

                {/* Spark button (Static) */}
                    <button className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-500 border border-slate-700/60">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </button>
            </aside>

            <main className="flex flex-1 flex-col overflow-hidden min-w-0">
                <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900 px-8">
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        finn<span className="text-emerald-400">City.</span>
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="rounded bg-slate-800 px-3 py-1 border border-slate-700">Mode: {viewMode.toUpperCase()}</span>
                        <span className="font-mono">Tick: #012</span>
                    </div>
                </header>
                {/* Page choices based on state viewMode */}
                <div className="flex-1 overflow-hidden bg-slate-950">
                    {viewMode === 'dashboard' ? <SimulationDashboard /> : <AgentManagement />}
                </div>
            </main>
        </div>
    );
}