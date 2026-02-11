import { useConfirmAction } from '@renderer/hooks/useConfirmAction';
import type { CronJob } from '../../../preload/api-types';

interface CronJobItemProps {
  job: CronJob;
  onToggle: () => void;
  onExecute: () => void;
  onRemove: () => void;
}

function formatTime(iso: string | null): string {
  if (!iso) return 'Never';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function CronJobItem({ job, onToggle, onExecute, onRemove }: CronJobItemProps): React.JSX.Element {
  const { confirming: confirmDelete, handleConfirmClick: handleDelete } = useConfirmAction(onRemove);

  return (
    <div
      style={{
        padding: '6px 8px',
        borderRadius: 6,
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      {/* Top row: name + controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Toggle */}
        <div
          onClick={onToggle}
          style={{
            width: 28,
            height: 16,
            borderRadius: 8,
            backgroundColor: job.enabled ? 'var(--accent)' : 'var(--border-color)',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background-color 0.15s ease',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: '#fff',
              position: 'absolute',
              top: 2,
              left: job.enabled ? 14 : 2,
              transition: 'left 0.15s ease',
            }}
          />
        </div>

        <span
          style={{
            fontSize: 12,
            color: job.enabled ? 'var(--text-primary)' : 'var(--text-secondary)',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {job.name}
        </span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: job.kind === 'agent' ? '#38bdf8' : 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 9999,
            padding: '0 5px',
          }}
        >
          {job.kind === 'agent' ? 'agent' : 'cmd'}
        </span>

        {/* Run now */}
        <span
          onClick={onExecute}
          style={{
            fontSize: 12,
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            padding: '0 2px',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#22c55e'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
          title="Run now"
        >
          ▶
        </span>

        {/* Delete */}
        <span
          onClick={handleDelete}
          style={{
            fontSize: 11,
            cursor: 'pointer',
            color: confirmDelete ? '#ef4444' : 'var(--text-secondary)',
            padding: '0 2px',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = confirmDelete ? '#ef4444' : 'var(--text-secondary)'; }}
        >
          {confirmDelete ? 'confirm?' : '×'}
        </span>
      </div>

      {/* Details row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10 }}>
        <span
          style={{
            fontFamily: 'monospace',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-primary)',
            padding: '1px 4px',
            borderRadius: 3,
          }}
        >
          {job.expression}
        </span>
        <span style={{ color: 'var(--text-secondary)', marginLeft: 'auto' }}>
          Last: {formatTime(job.lastRun)}
        </span>
      </div>
    </div>
  );
}
