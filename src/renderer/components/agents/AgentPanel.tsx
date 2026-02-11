import { useEffect } from 'react';
import { useAgentStore } from '@renderer/store/agent-store';
import { AgentItem } from './AgentItem';
import { sectionTitleStyle } from '@renderer/styles/ui';

export function AgentPanel(): React.JSX.Element {
  const agents = useAgentStore((s) => s.agents);
  const loading = useAgentStore((s) => s.loading);
  const loadAgents = useAgentStore((s) => s.loadAgents);
  const initListeners = useAgentStore((s) => s.initListeners);
  const stopAgent = useAgentStore((s) => s.stopAgent);

  useEffect(() => {
    initListeners();
    loadAgents();
  }, [initListeners, loadAgents]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={sectionTitleStyle}>Agents</span>
        {agents.length > 0 && (
          <span
            style={{
              fontSize: 10,
              backgroundColor: 'var(--accent)',
              color: '#fff',
              borderRadius: 9999,
              padding: '0 6px',
              fontWeight: 600,
            }}
          >
            {agents.length}
          </span>
        )}
      </div>

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {loading && (
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', padding: 4 }}>
            Loading...
          </span>
        )}

        {!loading && agents.length === 0 && (
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', padding: 4 }}>
            No agents running
          </span>
        )}

        {agents.map((agent) => (
          <AgentItem key={agent.id} agent={agent} onStop={() => stopAgent(agent.id)} />
        ))}
      </div>
    </div>
  );
}
