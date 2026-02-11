import type { TerminalSession } from '@renderer/store/terminal-store';

interface TerminalTabProps {
  session: TerminalSession;
  isActive: boolean;
  paneIndex?: number;
  onSelect: () => void;
  onClose: () => void;
}

export function TerminalTab({
  session,
  isActive,
  paneIndex,
  onSelect,
  onClose,
}: TerminalTabProps): React.JSX.Element {
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 8px',
        borderRadius: 4,
        backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontSize: 12,
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background-color 0.1s ease',
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {session.title}
      </span>
      {paneIndex !== undefined && (
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 9999,
            padding: '0 4px',
            lineHeight: '14px',
          }}
          title={`Pane ${paneIndex + 1}`}
        >
          {paneIndex + 1}
        </span>
      )}
      <span
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 16,
          height: 16,
          borderRadius: 3,
          fontSize: 14,
          lineHeight: 1,
          color: 'var(--text-secondary)',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        ×
      </span>
    </div>
  );
}
