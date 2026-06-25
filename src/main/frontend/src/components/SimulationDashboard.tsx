import {useState, useEffect} from 'react';
import type { AgentTrait } from '../types/agents.ts';

const API_BASE = 'http://localhost:8000/api';

// Define interfaces for live simulation data
interface LiveAgentSnapshot {
  Agent_name: string;
  financial_points: number;
  current_asset_allocation: string;
  is_bankrupt: boolean;
}

interface DiaryEntry {
  Agent_name: string;
  reasoning: string;
  tick: number;
  type: 'bankrupt' | 'swing';
  outcome: number;
}

interface LiveState {
  current_tick: number;
  current_month: number;
  market_condition: string;
  agent_snapshots: LiveAgentSnapshot[];
  diary_entries: DiaryEntry[];
}

export default function SimulationDashboard(){
  // State variables
  const [agents, setAgents] = useState<AgentTrait[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simRunning, setSimRunning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [liveState, setLiveState] = useState<LiveState | null>(null);

  // Fetch agents and simulation status on component mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/agents`);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
          const data: AgentTrait[] = await res.json();
          setAgents(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      };
    fetchAgents();
  }, []);

  // Periodically fetch simulation status and live state
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/simulation/status`);
        const data = await res.json();
        setSimRunning(data.running);
      } catch (err) {
        // Handle error silently for periodic fetch
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/simulation/live-state`);
        const data: LiveState = await res.json();
        setLiveState(data);
      } catch (err) {
        // Handle error silently for periodic fetch
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Function to start the simulation
  const handleStartSimulation = async () => {
    try {
      setStarting(true);
      const res = await fetch(`${API_BASE}/simulation/start-simulation`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'Simulation started' || data.status === 'started') {
        setSimRunning(true);
      }
    } catch (err) {
      // Handle error silently for start simulation
    } finally {
      setStarting(false);
    }
  };
  
  // Sort agents for leaderboard display
  const leaderboard = [...agents].sort(
    (a, b) => b.financial_points - a.financial_points
  );

  // Render loading, error, or main content based on state
  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-slate-500">
        Loading agents...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center text-red-500">
        Failed to load agents: {error}
      </div>
    );
  }
  //
  const liveAgents = liveState?.agent_snapshots ?? agents;
  const liveLeaderboard = [...liveAgents].sort(
    (a, b) => b.financial_points - a.financial_points
  );

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex border-b border-slate-800 pb-3 gap-2">
            <button className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 text-sm font-medium text-emerald-400">
              All Agents ({agents.length})
            </button>
            // Start Simulation Button
            <button 
                onClick={handleStartSimulation}
                disabled={simRunning || starting}
                className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 text-sm font-medium text-emerald-400 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
                {simRunning ? 'Simulation Running...' : starting ? 'Starting...' : 'Start Simulation'}
            </button>
          </div>
          // Display agents in a grid
          <div className="grid grid-cols-3 gap-4 pt-4">
              {agents.map((agent) => (
                <div
                  key={agent.Agent_name}
                  className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm"
                >
                <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold text-white">
                  {agent.Agent_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {agent.Agent_name}
                    {agent.is_bankrupt && ' 💀'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Points:{' '}
                    <span
                      className={
                        agent.is_bankrupt ? 'text-red-400' : 'text-emerald-400'
                      }>
                      {agent.financial_points} P
                    </span>
                  </p>
                </div>
              </div>
              ))}
          </div>
        </section>
        //
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase mb-4">
              Leaderboard {liveState ? `(Tick: ${liveState.current_tick})` : ''}
            </h2>
            <ol className="space-y-2 text-sm">
              {liveLeaderboard.map((agent, idx) => (
                <li
                  key={agent.Agent_name}
                  className="flex justify-between text-slate-300"
                >
                  <span>
                    {idx + 1}. {agent.Agent_name}
                  </span>
                  <span className="text-emerald-400">
                    {agent.financial_points} P
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase mb-4">
              Chart Real-time
            </h2>
            <p className="text-xs text-slate-500">
              D3.js Line Chart component goes here... (needs tick-history endpoint)
            </p>
          </div>
        </div>
      </div>

      // Diary Sidebar: All agents' diary entries for more than 3 points update
      <aside className="w-80 border-l border-slate-800 bg-slate-900 p-6 flex flex-col">
        <div className="border-b border-slate-800 pb-4 mb-4">
          <h2 className="text-lg font-bold text-white tracking-wide">
            Agent Diary.
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 text-sm text-slate-400">
          {!liveState || liveState.diary_entries.length === 0 ? (
            <p className="text-slate-500">No diary entries yet...</p>
          ) : (
            [...liveState.diary_entries].reverse().map((entry, idx) => (
              <div
                key={`${entry.Agent_name}-${entry.tick}-${idx}`}
                className={`rounded-lg bg-slate-950 p-3 border-l-2 " ${
                  entry.type === 'bankrupt' ? 'border-red-500' : 'border-amber-500'
                }`}>
                <span className="font-semibold text-white">{entry.Agent_name}</span>
                <span className="text-slate-500 text-xs ml-2">Tick #{entry.tick}</span>
                <p className="text-slate-300 mt-1">{entry.reasoning}</p>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}