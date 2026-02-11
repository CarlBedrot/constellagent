import { useState, useCallback } from 'react';
import { useWorktreeStore } from '@renderer/store/worktree-store';
import { useAgentStore } from '@renderer/store/agent-store';
import { useTerminalStore } from '@renderer/store/terminal-store';
import { WorktreeItem } from './WorktreeItem';
import { AddWorktreeDialog } from './AddWorktreeDialog';
import { sectionTitleStyle, iconButtonStyle, ghostButtonStyle } from '@renderer/styles/ui';

export function WorktreeList(): React.JSX.Element {
  const repoPath = useWorktreeStore((s) => s.repoPath);
  const worktrees = useWorktreeStore((s) => s.worktrees);
  const selectedWorktree = useWorktreeStore((s) => s.selectedWorktree);
  const loading = useWorktreeStore((s) => s.loading);
  const error = useWorktreeStore((s) => s.error);
  const setRepoPath = useWorktreeStore((s) => s.setRepoPath);
  const selectWorktree = useWorktreeStore((s) => s.selectWorktree);
  const removeWorktree = useWorktreeStore((s) => s.removeWorktree);
  const loadWorktrees = useWorktreeStore((s) => s.loadWorktrees);

  const launchAgent = useAgentStore((s) => s.launchAgent);

  const [showDialog, setShowDialog] = useState(false);
  const [launchingAgent, setLaunchingAgent] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  const handleOpenRepo = useCallback(async () => {
    const result = await window.api.git.selectDirectory();
    if (result.success && result.data.path) {
      setRepoPath(result.data.path);
    }
  }, [setRepoPath]);

  const handleRemove = useCallback(
    async (path: string, force = false) => {
      await removeWorktree(path, force);
    },
    [removeWorktree]
  );

  const handleLaunchAgent = useCallback(async () => {
    if (!repoPath || launchingAgent) return;
    setLaunchingAgent(true);
    setLaunchError(null);

    const result = await launchAgent(repoPath);
    setLaunchingAgent(false);

    if (result.ok && result.agent) {
      await loadWorktrees();
      selectWorktree(result.agent.worktreePath);
      useTerminalStore.getState().addSession({
        id: result.agent.sessionId,
        title: result.agent.name,
      });
      useTerminalStore.getState().assignSessionToActivePane(result.agent.sessionId);
      return;
    }

    setLaunchError(result.error ?? 'Failed to launch agent');
  }, [repoPath, launchingAgent, launchAgent, loadWorktrees, selectWorktree]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minHeight: 0 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={sectionTitleStyle}
        >
          Worktrees
        </span>
        {repoPath && (
          <button
            onClick={handleLaunchAgent}
            disabled={launchingAgent}
            style={{
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid var(--border-color)',
              backgroundColor: launchingAgent ? 'var(--bg-secondary)' : 'transparent',
              color: 'var(--text-secondary)',
              fontSize: 10,
              cursor: launchingAgent ? 'default' : 'pointer',
            }}
            title="Create a worktree and launch Claude"
          >
            {launchingAgent ? 'Launching...' : 'Launch agent'}
          </button>
        )}
        {repoPath && (
          <span
            onClick={() => setShowDialog(true)}
            style={iconButtonStyle}
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

        {launchError && (
          <span style={{ fontSize: 11, color: '#ef4444', padding: '4px 0' }}>{launchError}</span>
        )}

        {!loading &&
          worktrees.map((wt) => (
            <WorktreeItem
              key={wt.path}
              worktree={wt}
              isSelected={wt.path === selectedWorktree}
              onSelect={() => selectWorktree(wt.path)}
              onRemove={(force) => handleRemove(wt.path, force)}
            />
          ))}
      </div>

      {/* Change repo button */}
      {repoPath && (
        <button
          onClick={handleOpenRepo}
          style={ghostButtonStyle}
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
