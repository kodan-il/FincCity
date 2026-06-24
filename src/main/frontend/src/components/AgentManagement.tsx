// components/AgentManagement.tsx
import { useState, useEffect } from 'react';
import type { AgentTrait } from '../types/agents.ts';

const API_BASE = 'http://localhost:8000/api';

const ECONOMIC_LABELS: Record<AgentTrait['economic_level'], string> = {
  low: 'Lower Class',
  middle: 'Middle Class',
  'upper-middle': 'Upper-Middle Class',
};

const LITERACY_LABELS: Record<AgentTrait['literacy_level'], string> = {
  low: 'Low Literacy (High Risk Bias)',
  medium: 'Medium Literacy',
  high: 'High Literacy (Risk-Aware)',
};

const FOMO_LABELS: Record<AgentTrait['fomo_level'], string> = {
  low: 'Low (Stable Mindset)',
  medium: 'Medium',
  high: 'High (Highly Vulnerable to Volatility)',
};

const TENDENCY_LABELS: Record<AgentTrait['tendency'], string> = {
  'risk-averse': 'Risk-Averse (Capital Preservation)',
  neutral: 'Neutral',
  'risk-seeking': 'Risk-Seeking (Aggressive Speculation)',
};

const PERSONALITY_LABELS: Record<AgentTrait['personality'], string> = {
  impulsive: 'Impulsive (Gut Reaction)',
  analytical: 'Analytical (Calculated)',
  'herd-follower': 'Herd-Follower (Social Validation)',
  contrarian: 'Contrarian (Anti-Trend)',
};

export default function AgentManagement() {
  const [agents, setAgents] = useState<AgentTrait[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentTrait | null>(null);
  const [originalAgent, setOriginalAgent] = useState<AgentTrait | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSelectAgent = (agentName: string) => {
    const found = agents.find((a) => a.Agent_name === agentName);
    setSelectedAgent(found ?? null);
    setOriginalAgent(found ?? null);
    setError(null);
  };

  const handleTraitChange = <K extends keyof AgentTrait>(
    field: K,
    value: AgentTrait[K]
  ) => {
    if (!selectedAgent) return;
    setSelectedAgent({ ...selectedAgent, [field]: value });
  };

  const handleResetChanges = () => {
    setSelectedAgent(originalAgent);
  };

  const hasUnsavedChanges =
    selectedAgent && originalAgent
      ? JSON.stringify(selectedAgent) !== JSON.stringify(originalAgent)
      : false;

  const handleSyncToBackend = async () => {
    if (!selectedAgent) return;
    try {
      setSyncing(true);
      setError(null);
      const res = await fetch(`${API_BASE}/agents/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedAgent),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.detail ?? `Sync failed: ${res.status}`);
      }
      const updated: AgentTrait = await res.json();

      setAgents((prev) =>
        prev.map((a) => (a.Agent_name === updated.Agent_name ? updated : a))
      );
      setSelectedAgent(updated);
      setOriginalAgent(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center text-slate-500">
        Loading agents...
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden bg-slate-950 p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">
          Agent Management System
        </h1>
        <p className="text-sm text-slate-500">/ finnCity Workspace</p>
      </div>

      {/* Agent List */}
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <span className="text-sm font-semibold text-emerald-400 border-b-2 border-emerald-400 pb-3 -mb-3">
            Agents List ({agents.length})
          </span>
        </div>

        <div className="flex flex-wrap gap-6">
          {agents.map((agent) => {
            const isSelected = selectedAgent?.Agent_name === agent.Agent_name;
            return (
              <button
                key={agent.Agent_name}
                onClick={() => handleSelectAgent(agent.Agent_name)}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={`h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold border-2 transition ${
                    agent.is_bankrupt
                      ? 'border-red-500/40 bg-slate-800 text-red-400'
                      : isSelected
                      ? 'border-emerald-400 bg-slate-800 text-white'
                      : 'border-slate-700 bg-slate-800 text-slate-300 group-hover:border-slate-500'
                  }`}
                >
                  {agent.Agent_name.charAt(0)}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isSelected ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {agent.Agent_name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Hyper-tuning panel */}
      {selectedAgent && (
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wider text-slate-400 uppercase mb-5">
            ⚙ Agent Parameter Hyper-Tuning (Pydantic Sync)
          </h2>

          <div className="grid grid-cols-[200px_minmax(0,1fr)] gap-8">
            {/* Avatar card */}
            <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-5">
              <div className="h-20 w-20 rounded-full border-2 border-emerald-400 bg-slate-800 flex items-center justify-center text-2xl font-bold text-white">
                {selectedAgent.Agent_name.charAt(0)}
              </div>
              <span className="font-semibold text-white">
                {selectedAgent.Agent_name}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-mono ${
                  selectedAgent.is_bankrupt
                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {selectedAgent.is_bankrupt
                  ? 'BANKRUPT'
                  : `Wallet: ${selectedAgent.financial_points} Points`}
              </span>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-2 gap-5">
              <Field label="Agent Name">
                <input
                  type="text"
                  value={selectedAgent.Agent_name}
                  disabled
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-400 cursor-not-allowed"
                />
              </Field>

              <Field label="Economic Level">
                <select
                  value={selectedAgent.economic_level}
                  onChange={(e) =>
                    handleTraitChange(
                      'economic_level',
                      e.target.value as AgentTrait['economic_level']
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  {Object.entries(ECONOMIC_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Financial Literacy Level">
                <select
                  value={selectedAgent.literacy_level}
                  onChange={(e) =>
                    handleTraitChange(
                      'literacy_level',
                      e.target.value as AgentTrait['literacy_level']
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  {Object.entries(LITERACY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="FOMO Sensitivity Level">
                <select
                  value={selectedAgent.fomo_level}
                  onChange={(e) =>
                    handleTraitChange(
                      'fomo_level',
                      e.target.value as AgentTrait['fomo_level']
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  {Object.entries(FOMO_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Investment Tendency Strategy">
                <select
                  value={selectedAgent.tendency}
                  onChange={(e) =>
                    handleTraitChange(
                      'tendency',
                      e.target.value as AgentTrait['tendency']
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  {Object.entries(TENDENCY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Core Cognitive Personality">
                <select
                  value={selectedAgent.personality}
                  onChange={(e) =>
                    handleTraitChange(
                      'personality',
                      e.target.value as AgentTrait['personality']
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  {Object.entries(PERSONALITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-800">
            <button
              onClick={handleResetChanges}
              disabled={!hasUnsavedChanges}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition"
            >
              Reset Changes
            </button>
            <button
              onClick={handleSyncToBackend}
              disabled={syncing || !hasUnsavedChanges}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-emerald-500 transition"
            >
              {syncing ? 'Syncing...' : 'Sync Trait Variables to Agent AI'}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </section>
      )}
    </div>
  );
}

// Small helper component for consistent label+field spacing
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-400 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}