import { useEffect } from 'react';
import { useAgentStore } from '@renderer/store/agent-store';
import { useTerminalStore } from '@renderer/store/terminal-store';
import { AgentItem } from './AgentItem';
import { sectionTitleStyle } from '@renderer/styles/ui';

export function AgentPanel(): React.JSX.Element {
  const agents = useAgentStore((s) => s.agents);
  const loading = useAgentStore((s) => s.loading);
  const loadAgents = useAgentStore((s) => s.loadAgents);
  const initListeners = useAgentStore((s) => s.initListeners);
  const stopAgent = useAgentStore((s) => s.stopAgent);
  const restartAgent = useAgentStore((s) => s.restartAgent);
  const addSession = useTerminalStore((s) => s.addSession);

  useEffect(() => {
    initListeners();
    loadAgents();
  }, [initListeners, loadAgents]);

  const openTerminal = async (worktreePath: string, title: string) => {
    const result = await window.api.pty.create(worktreePath);
    if (!result.success) return;
    addSession({ id: result.data.sessionId, title });
  };

  const openLogs = async (agent: { worktreePath: string; logPath: string | null; name: string }) => {
    if (!agent.logPath) return;
    const result = await window.api.pty.create(agent.worktreePath);
    if (!result.success) return;
    addSession({ id: result.data.sessionId, title: `${agent.name} logs` });
    window.api.pty.write(result.data.sessionId, `tail -n 200 -f \"${agent.logPath}\"\n`);
  };

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
          <AgentItem
            key={agent.id}
            agent={agent}
            onStop={() => stopAgent(agent.id)}
            onRestart={() => restartAgent(agent.id)}
            onOpenTerminal={() => openTerminal(agent.worktreePath, agent.name)}
            onOpenLogs={() => openLogs(agent)}
          />
        ))}
      </div>
    </div>
  );
}
