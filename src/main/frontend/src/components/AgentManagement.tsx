// components/AgentManagement.tsx
import { useEffect, useState, type ReactNode } from 'react';
import type { AgentTrait } from '../types/agents.ts';

const API_BASE = 'http://127.0.0.1:8000/api';

const ECONOMIC_LABELS: Record<AgentTrait['economic_level'], string> = {
  low: 'Lower Class',
  middle: 'Middle Class',
  'upper-middle': 'Upper-Middle Class',
};

const LITERACY_LABELS: Record<AgentTrait['literacy_level'], string> = {
  low: 'Low Literacy',
  medium: 'Medium Literacy',
  high: 'High Literacy',
};

const FOMO_LABELS: Record<AgentTrait['fomo_level'], string> = {
  low: 'Low FOMO',
  medium: 'Medium FOMO',
  high: 'High FOMO',
};

const TENDENCY_LABELS: Record<AgentTrait['tendency'], string> = {
  'risk-averse': 'Risk-Averse',
  neutral: 'Neutral',
  'risk-seeking': 'Risk-Seeking',
};

const PERSONALITY_LABELS: Record<AgentTrait['personality'], string> = {
  impulsive: 'Impulsive',
  analytical: 'Analytical',
  'herd-follower': 'Herd-Follower',
  contrarian: 'Contrarian',
};

const AGENT_META: Record<string, { emoji: string; title: string; home: string }> = {
  Bryan: { emoji: '👦🏻', title: 'Curious saver', home: 'Blueberry Lane' },
  Bernard: { emoji: '🧑🏾‍💼', title: 'Careful planner', home: 'Ledger Street' },
  Barbara: { emoji: '👩🏽‍🦱', title: 'Trend watcher', home: 'Market Square' },
  Richard: { emoji: '🧑🏻‍💻', title: 'Number cruncher', home: 'Compass Court' },
  Eriko: { emoji: '👩🏼‍💻', title: 'Market dreamer', home: 'Pixel Pier' },
  Lauren: { emoji: '👩🏻‍🎤', title: 'Future focused', home: 'Garden Row' },
  Micah: { emoji: '🎧', title: 'Chill investor', home: 'Lo-fi Loft' },
  Lucius: { emoji: '😎', title: 'Bold mover', home: 'Rocket Road' },
  Anne: { emoji: '👩🏽‍🚀', title: 'Risk explorer', home: 'Orbit Avenue' },
  Michelle: { emoji: '👩🏻‍💼', title: 'Stable strategist', home: 'Harbor House' },
};

function getAgentMeta(name: string) {
  return AGENT_META[name] ?? { emoji: '🙂', title: 'Citizen investor', home: 'FinnCity' };
}

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
        if (data.length > 0) {
          setSelectedAgent(data[0]);
          setOriginalAgent(data[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const handleSelectAgent = (agentName: string) => {
    const found = agents.find((a) => a.Agent_name === agentName) ?? null;
    setSelectedAgent(found);
    setOriginalAgent(found);
    setError(null);
  };

  const handleTraitChange = <K extends keyof AgentTrait>(field: K, value: AgentTrait[K]) => {
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
      setAgents((prev) => prev.map((a) => (a.Agent_name === updated.Agent_name ? updated : a)));
      setSelectedAgent(updated);
      setOriginalAgent(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <div className="agent-workshop-loading">Loading citizens...</div>;
  }

  const selectedMeta = selectedAgent ? getAgentMeta(selectedAgent.Agent_name) : null;

  return (
    <div className="agent-workshop-page overflow-y-auto h-full">
      <section className="agent-workshop-hero">
        <div>
          <div className="orange-ribbon">🏘 Citizen Workshop</div>
          <h1>Tune your FinnCity citizens</h1>
          <p>Adjust each citizen&apos;s traits before the simulation begins.</p>
        </div>
        <div className="workshop-stats-card">
          <span>Total citizens</span>
          <strong>{agents.length}</strong>
        </div>
      </section>

      <section className="agent-roster-card">
        <div className="section-heading-row">
          <div>
            <div className="purple-ribbon">👥 Citizen Roster</div>
            <p>Pick a citizen to customize their behavior.</p>
          </div>
        </div>

        <div className="agent-roster-grid">
          {agents.map((agent) => {
            const isSelected = selectedAgent?.Agent_name === agent.Agent_name;
            const meta = getAgentMeta(agent.Agent_name);

            return (
              <button
                key={agent.Agent_name}
                onClick={() => handleSelectAgent(agent.Agent_name)}
                className={`roster-citizen-card ${isSelected ? 'selected' : ''}`}
              >
                <div className="roster-avatar">{meta.emoji}</div>
                <div className="roster-info">
                  <strong>{agent.Agent_name}</strong>
                  <span>{meta.title}</span>
                </div>
                <div className={agent.is_bankrupt ? 'status-pill danger' : 'status-pill'}>
                  {agent.is_bankrupt ? 'Needs help' : `${agent.financial_points} coins`}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {selectedAgent && selectedMeta && (
        <section className="agent-editor-card">
          <div className="editor-profile-card">
            <div className="editor-avatar">{selectedMeta.emoji}</div>
            <h2>{selectedAgent.Agent_name}</h2>
            <p>{selectedMeta.title} • {selectedMeta.home}</p>
            <div className={selectedAgent.is_bankrupt ? 'wallet-pill danger' : 'wallet-pill'}>
              {selectedAgent.is_bankrupt ? '💔 Bankrupt' : `🪙 ${selectedAgent.financial_points} coins`}
            </div>
            <div className="mayor-note-card">
              <span>🐶 Mayor Pup says</span>
              <p>Small trait changes can completely change this citizen&apos;s investment style.</p>
            </div>
          </div>

          <div className="editor-form-card">
            <div className="section-heading-row">
              <div>
                <div className="green-ribbon">⚙ Trait Tuning</div>
                <p>Sync these values back to the AI agent profile.</p>
              </div>
              {hasUnsavedChanges && <span className="unsaved-badge">Unsaved changes</span>}
            </div>

            <div className="trait-form-grid">
              <Field label="Citizen name">
                <input value={selectedAgent.Agent_name} disabled className="soft-input disabled" />
              </Field>

              <Field label="Economic level">
                <select
                  value={selectedAgent.economic_level}
                  onChange={(e) =>
                    handleTraitChange('economic_level', e.target.value as AgentTrait['economic_level'])
                  }
                  className="soft-input"
                >
                  {Object.entries(ECONOMIC_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Financial literacy">
                <select
                  value={selectedAgent.literacy_level}
                  onChange={(e) =>
                    handleTraitChange('literacy_level', e.target.value as AgentTrait['literacy_level'])
                  }
                  className="soft-input"
                >
                  {Object.entries(LITERACY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </Field>

              <Field label="FOMO sensitivity">
                <select
                  value={selectedAgent.fomo_level}
                  onChange={(e) =>
                    handleTraitChange('fomo_level', e.target.value as AgentTrait['fomo_level'])
                  }
                  className="soft-input"
                >
                  {Object.entries(FOMO_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Investment tendency">
                <select
                  value={selectedAgent.tendency}
                  onChange={(e) =>
                    handleTraitChange('tendency', e.target.value as AgentTrait['tendency'])
                  }
                  className="soft-input"
                >
                  {Object.entries(TENDENCY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Core personality">
                <select
                  value={selectedAgent.personality}
                  onChange={(e) =>
                    handleTraitChange('personality', e.target.value as AgentTrait['personality'])
                  }
                  className="soft-input"
                >
                  {Object.entries(PERSONALITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="editor-actions">
              <button
                onClick={handleResetChanges}
                disabled={!hasUnsavedChanges}
                className="secondary-game-button"
              >
                Reset Changes
              </button>
              <button
                onClick={handleSyncToBackend}
                disabled={syncing || !hasUnsavedChanges}
                className="primary-game-button"
              >
                {syncing ? 'Syncing...' : 'Sync to Agent AI'}
              </button>
            </div>

            {error && <p className="workshop-error">{error}</p>}
          </div>
        </section>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="trait-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
