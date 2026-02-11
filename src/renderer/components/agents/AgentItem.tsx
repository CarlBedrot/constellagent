import type { AgentSession } from '../../../preload/api-types';

interface AgentItemProps {
  agent: AgentSession;
  onStop: () => void;
  onRestart: () => void;
  onOpenTerminal: () => void;
  onOpenLogs: () => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function abbreviatePath(fullPath: string): string {
  const parts = fullPath.split('/');
  return parts.length > 2 ? `.../${parts.slice(-2).join('/')}` : fullPath;
}

function statusColor(status: AgentSession['status']): string {
  switch (status) {
    case 'running':
      return '#22c55e';
    case 'starting':
      return '#eab308';
    case 'stopping':
      return '#f97316';
    case 'detached':
      return '#a1a1aa';
    case 'error':
      return '#ef4444';
    default:
      return '#71717a';
  }
}

export function AgentItem({
  agent,
  onStop,
  onRestart,
  onOpenTerminal,
  onOpenLogs,
}: AgentItemProps): React.JSX.Element {
  const isActive = agent.status === 'running' || agent.status === 'starting' || agent.status === 'stopping';
  const canRestart = agent.status === 'detached' || agent.status === 'exited' || agent.status === 'error';

  return (
    <div
      style={{
        padding: '6px 8px',
        borderRadius: 6,
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            fontSize: 12,
            color: 'var(--text-primary)',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {agent.name}
        </span>
        <span
          style={{
            fontSize: 10,
            color: statusColor(agent.status),
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {agent.status}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={onOpenTerminal}
          style={{
            padding: '2px 6px',
            borderRadius: 4,
            border: '1px solid var(--border-color)',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: 10,
            cursor: 'pointer',
          }}
        >
          Terminal
        </button>
        <button
          onClick={onOpenLogs}
          disabled={!agent.logPath}
          style={{
            padding: '2px 6px',
            borderRadius: 4,
            border: '1px solid var(--border-color)',
            backgroundColor: agent.logPath ? 'transparent' : 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            fontSize: 10,
            cursor: agent.logPath ? 'pointer' : 'default',
          }}
        >
          Logs
        </button>
        <button
          onClick={onRestart}
          disabled={!canRestart}
          style={{
            padding: '2px 6px',
            borderRadius: 4,
            border: '1px solid var(--border-color)',
            backgroundColor: canRestart ? 'transparent' : 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            fontSize: 10,
            cursor: canRestart ? 'pointer' : 'default',
          }}
        >
          Restart
        </button>
        <button
          onClick={onStop}
          disabled={!isActive}
          style={{
            padding: '2px 6px',
            borderRadius: 4,
            border: '1px solid var(--border-color)',
            backgroundColor: isActive ? 'transparent' : 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            fontSize: 10,
            cursor: isActive ? 'pointer' : 'default',
            marginLeft: 'auto',
          }}
        >
          Stop
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            fontSize: 10,
            color: 'var(--text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={agent.worktreePath}
        >
          {abbreviatePath(agent.worktreePath)}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-secondary)', marginLeft: 'auto' }}>
          {formatTime(agent.startedAt)}
        </span>
      </div>

      <div
        style={{
          fontFamily: 'monospace',
          fontSize: 10,
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 4,
          padding: '4px 6px',
          minHeight: 32,
        }}
      >
        {agent.lastOutput.length > 0 ? (
          agent.lastOutput.map((line, idx) => (
            <div key={`${agent.id}-${idx}`} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {line}
            </div>
          ))
        ) : (
          <span>Waiting for output...</span>
        )}
      </div>

      {agent.status === 'detached' && (
        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
          Detached from previous session. Restart to reconnect.
        </div>
      )}

      {agent.error && (
        <div style={{ fontSize: 10, color: '#ef4444' }}>{agent.error}</div>
      )}
    </div>
  );
}
