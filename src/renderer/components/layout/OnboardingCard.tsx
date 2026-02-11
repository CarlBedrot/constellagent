import { useWorktreeStore } from '@renderer/store/worktree-store';
import { useAgentStore } from '@renderer/store/agent-store';

export function OnboardingCard(): React.JSX.Element | null {
  const repoPath = useWorktreeStore((s) => s.repoPath);
  const agentCount = useAgentStore((s) => s.agents.length);

  if (repoPath && agentCount > 0) return null;

  const steps = [
    { title: 'Select a repository', done: Boolean(repoPath) },
    { title: 'Launch an agent', done: Boolean(repoPath) && agentCount > 0 },
    { title: 'Track agents in the dashboard', done: agentCount > 0 },
  ];

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
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>
        Getting started
      </span>
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
    </div>
  );
}
