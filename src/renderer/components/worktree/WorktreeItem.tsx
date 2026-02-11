import { useConfirmAction } from '@renderer/hooks/useConfirmAction';
import type { WorktreeInfo } from '../../../preload/api-types';

interface WorktreeItemProps {
  worktree: WorktreeInfo;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

const BRANCH_COLORS = [
  '#6d28d9', '#2563eb', '#059669', '#d97706', '#dc2626',
  '#7c3aed', '#0891b2', '#65a30d', '#ea580c', '#db2777',
];

function branchColor(branch: string): string {
  let hash = 0;
  for (let i = 0; i < branch.length; i++) {
    hash = (hash * 31 + branch.charCodeAt(i)) | 0;
  }
  return BRANCH_COLORS[Math.abs(hash) % BRANCH_COLORS.length];
}

function abbreviatePath(fullPath: string): string {
  const parts = fullPath.split('/');
  return parts.length > 2 ? `.../${parts.slice(-2).join('/')}` : fullPath;
}

export function WorktreeItem({
  worktree,
  isSelected,
  onSelect,
  onRemove,
}: WorktreeItemProps): React.JSX.Element {
  const { confirming: confirmDelete, handleConfirmClick: handleDelete } = useConfirmAction(onRemove);

  return (
    <div
      onClick={onSelect}
      style={{
        padding: '8px 10px',
        borderRadius: 6,
        backgroundColor: isSelected ? 'var(--bg-tertiary)' : 'transparent',
        border: isSelected ? '1px solid var(--border-color)' : '1px solid transparent',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        transition: 'background-color 0.1s ease',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Branch badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '1px 6px',
            borderRadius: 9999,
            fontSize: 10,
            fontWeight: 600,
            color: '#fff',
            backgroundColor: branchColor(worktree.branch),
            whiteSpace: 'nowrap',
            maxWidth: 120,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {worktree.branch || '(bare)'}
        </span>

        {worktree.isMain && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            main
          </span>
        )}

        <div style={{ flex: 1 }} />

        {/* Delete button (not for main worktree) */}
        {!worktree.isMain && (
          <span
            onClick={handleDelete}
            style={{
              fontSize: 11,
              color: confirmDelete ? '#ef4444' : 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0 4px',
              borderRadius: 3,
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = confirmDelete ? '#ef4444' : 'var(--text-secondary)';
            }}
          >
            {confirmDelete ? 'confirm?' : '×'}
          </span>
        )}
      </div>

      {/* Path */}
      <span
        style={{
          fontSize: 11,
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={worktree.path}
      >
        {abbreviatePath(worktree.path)}
      </span>
    </div>
  );
}
