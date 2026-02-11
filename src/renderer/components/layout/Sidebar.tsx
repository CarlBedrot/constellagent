import { WorktreeList } from '../worktree/WorktreeList';
import { CronPanel } from '../cron/CronPanel';
import { AgentPanel } from '../agents/AgentPanel';

export function Sidebar(): React.JSX.Element {
  return (
    <div
      style={{
        height: '100%',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        overflow: 'hidden',
      }}
    >
      {/* Worktrees section */}
      <WorktreeList />

      {/* Divider */}
      <div
        style={{
          height: 1,
          backgroundColor: 'var(--border-color)',
          flexShrink: 0,
        }}
      />

      {/* Cron jobs section */}
      <CronPanel />

      {/* Divider */}
      <div
        style={{
          height: 1,
          backgroundColor: 'var(--border-color)',
          flexShrink: 0,
        }}
      />

      {/* Agents section */}
      <AgentPanel />
    </div>
  );
}
