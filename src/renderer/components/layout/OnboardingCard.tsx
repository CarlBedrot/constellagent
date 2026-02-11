import { useEffect, useState } from 'react';
import { useWorktreeStore } from '@renderer/store/worktree-store';
import { useAgentStore } from '@renderer/store/agent-store';

export function OnboardingCard(): React.JSX.Element | null {
  const repoPath = useWorktreeStore((s) => s.repoPath);
  const agentCount = useAgentStore((s) => s.agents.length);
  const setRepoPath = useWorktreeStore((s) => s.setRepoPath);
  const launchAgent = useAgentStore((s) => s.launchAgent);
  const loadWorktrees = useWorktreeStore((s) => s.loadWorktrees);
  const [dismissed, setDismissed] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('constellagent:onboarding-dismissed');
    if (stored === 'true') {
      setDismissed(true);
    }
  }, []);

  if (dismissed || (repoPath && agentCount > 0)) return null;

  const steps = [
    { title: 'Select a repository', done: Boolean(repoPath) },
    { title: 'Launch an agent', done: Boolean(repoPath) && agentCount > 0 },
    { title: 'Track agents in the dashboard', done: agentCount > 0 },
  ];

  const openRepository = async () => {
    const result = await window.api.git.selectDirectory();
    if (result.success && result.data.path) {
      setRepoPath(result.data.path);
    }
  };

  const handleLaunchAgent = async () => {
    if (!repoPath || launching) return;
    setError(null);
    setLaunching(true);
    const result = await launchAgent(repoPath);
    setLaunching(false);
    if (result.ok) {
      await loadWorktrees();
    } else {
      setError(result.error ?? 'Failed to launch agent');
    }
  };

  return (
    <div
      style={{
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: 8,
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
          Getting started
        </span>
        <button
          onClick={() => {
            localStorage.setItem('constellagent:onboarding-dismissed', 'true');
            setDismissed(true);
          }}
          style={{
            border: 'none',
            background: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: 12,
            cursor: 'pointer',
          }}
          title="Dismiss"
        >
          ×
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {steps.map((step, idx) => (
          <div
            key={step.title}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 9999,
                border: '1px solid var(--border-color)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: step.done ? '#22c55e' : 'var(--text-secondary)',
                backgroundColor: step.done ? 'rgba(34,197,94,0.1)' : 'transparent',
              }}
            >
              {idx + 1}
            </span>
            <span style={{ color: step.done ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {step.title}
            </span>
          </div>
        ))}
      </div>
      {!repoPath && (
        <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
          Start by opening a Git repository.
        </span>
      )}
      {repoPath && agentCount === 0 && (
        <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
          Use “Launch agent” in Worktrees to get going.
        </span>
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={openRepository}
          style={{
            padding: '4px 8px',
            borderRadius: 4,
            border: '1px solid var(--border-color)',
            backgroundColor: 'transparent',
            color: 'var(--text-secondary)',
            fontSize: 10,
            cursor: 'pointer',
            flex: 1,
          }}
        >
          Open repo
        </button>
        <button
          onClick={handleLaunchAgent}
          disabled={!repoPath || launching}
          style={{
            padding: '4px 8px',
            borderRadius: 4,
            border: '1px solid var(--border-color)',
            backgroundColor: launching ? 'var(--bg-secondary)' : 'transparent',
            color: 'var(--text-secondary)',
            fontSize: 10,
            cursor: repoPath && !launching ? 'pointer' : 'default',
            flex: 1,
          }}
        >
          {launching ? 'Launching...' : 'Launch agent'}
        </button>
      </div>

      {error && (
        <span style={{ fontSize: 10, color: '#ef4444' }}>{error}</span>
      )}
    </div>
  );
}
