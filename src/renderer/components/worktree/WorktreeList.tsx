import { useState, useCallback } from 'react';
import { useWorktreeStore } from '@renderer/store/worktree-store';
import { WorktreeItem } from './WorktreeItem';
import { AddWorktreeDialog } from './AddWorktreeDialog';

export function WorktreeList(): React.JSX.Element {
  const repoPath = useWorktreeStore((s) => s.repoPath);
  const worktrees = useWorktreeStore((s) => s.worktrees);
  const selectedWorktree = useWorktreeStore((s) => s.selectedWorktree);
  const loading = useWorktreeStore((s) => s.loading);
  const error = useWorktreeStore((s) => s.error);
  const setRepoPath = useWorktreeStore((s) => s.setRepoPath);
  const selectWorktree = useWorktreeStore((s) => s.selectWorktree);
  const removeWorktree = useWorktreeStore((s) => s.removeWorktree);

  const [showDialog, setShowDialog] = useState(false);

  const handleOpenRepo = useCallback(async () => {
    const result = await window.api.git.selectDirectory();
    if (result.success && result.data.path) {
      setRepoPath(result.data.path);
    }
  }, [setRepoPath]);

  const handleRemove = useCallback(
    async (path: string) => {
      await removeWorktree(path, false);
    },
    [removeWorktree]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minHeight: 0 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-secondary)',
            flex: 1,
          }}
        >
          Worktrees
        </span>
        {repoPath && (
          <span
            onClick={() => setShowDialog(true)}
            style={{
              fontSize: 16,
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '0 2px',
              borderRadius: 3,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
            title="Add worktree"
          >
            +
          </span>
        )}
      </div>

      {/* Repo name */}
      {repoPath && (
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            padding: '2px 0',
          }}
          title={repoPath}
        >
          {repoPath.split('/').pop()}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {!repoPath && (
          <button
            onClick={handleOpenRepo}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: 12,
              cursor: 'pointer',
              marginTop: 4,
              transition: 'border-color 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            Open Repository
          </button>
        )}

        {loading && (
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '8px 0' }}>
            Loading...
          </span>
        )}

        {error && (
          <span style={{ fontSize: 11, color: '#ef4444', padding: '4px 0' }}>{error}</span>
        )}

        {!loading &&
          worktrees.map((wt) => (
            <WorktreeItem
              key={wt.path}
              worktree={wt}
              isSelected={wt.path === selectedWorktree}
              onSelect={() => selectWorktree(wt.path)}
              onRemove={() => handleRemove(wt.path)}
            />
          ))}
      </div>

      {/* Change repo button */}
      {repoPath && (
        <button
          onClick={handleOpenRepo}
          style={{
            padding: '4px 8px',
            borderRadius: 4,
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: 11,
            cursor: 'pointer',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          Change repository...
        </button>
      )}

      {showDialog && <AddWorktreeDialog onClose={() => setShowDialog(false)} />}
    </div>
  );
}
