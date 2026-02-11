import { useState } from 'react';
import { useWorktreeStore } from '@renderer/store/worktree-store';

interface AddWorktreeDialogProps {
  onClose: () => void;
}

export function AddWorktreeDialog({ onClose }: AddWorktreeDialogProps): React.JSX.Element {
  const repoPath = useWorktreeStore((s) => s.repoPath);
  const addWorktree = useWorktreeStore((s) => s.addWorktree);

  const [path, setPath] = useState('');
  const [branch, setBranch] = useState('');
  const [createBranch, setCreateBranch] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!path.trim() || !branch.trim()) {
      setError('Path and branch are required');
      return;
    }
    setSubmitting(true);
    setError(null);

    const worktreePath = path.startsWith('/')
      ? path
      : `${repoPath}/../${path}`;

    const ok = await addWorktree(worktreePath, branch.trim(), createBranch);
    setSubmitting(false);
    if (ok) {
      onClose();
    } else {
      setError(useWorktreeStore.getState().error ?? 'Failed to add worktree');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '6px 8px',
    borderRadius: 4,
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: 12,
    outline: 'none',
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 8,
          padding: 20,
          width: 360,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
          Add Worktree
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Path</label>
          <input
            style={inputStyle}
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="e.g. ../my-feature or /absolute/path"
            autoFocus
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Branch</label>
          <input
            style={inputStyle}
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="e.g. feature/my-branch"
          />
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={createBranch}
            onChange={(e) => setCreateBranch(e.target.checked)}
            style={{ accentColor: 'var(--accent)' }}
          />
          Create new branch
        </label>

        {error && (
          <span style={{ fontSize: 11, color: '#ef4444' }}>{error}</span>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px',
              borderRadius: 4,
              border: '1px solid var(--border-color)',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '6px 14px',
              borderRadius: 4,
              border: 'none',
              backgroundColor: submitting ? 'var(--border-color)' : 'var(--accent)',
              color: '#fff',
              fontSize: 12,
              cursor: submitting ? 'default' : 'pointer',
            }}
          >
            {submitting ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
