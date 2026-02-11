import { useEffect, useState } from 'react';
import { useCronStore } from '@renderer/store/cron-store';
import { useWorktreeStore } from '@renderer/store/worktree-store';
import { CronJobItem } from './CronJobItem';
import { CronExpressionInput } from './CronExpressionInput';
import { sectionTitleStyle, iconButtonStyle } from '@renderer/styles/ui';

export function CronPanel(): React.JSX.Element {
  const jobs = useCronStore((s) => s.jobs);
  const loading = useCronStore((s) => s.loading);
  const loadJobs = useCronStore((s) => s.loadJobs);
  const addJob = useCronStore((s) => s.addJob);
  const removeJob = useCronStore((s) => s.removeJob);
  const toggleJob = useCronStore((s) => s.toggleJob);
  const executeJob = useCronStore((s) => s.executeJob);
  const selectedWorktree = useWorktreeStore((s) => s.selectedWorktree);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [command, setCommand] = useState('');
  const [expression, setExpression] = useState('*/5 * * * *');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleAdd = async () => {
    if (!name.trim() || !command.trim() || !expression.trim()) return;
    setSubmitting(true);
    const ok = await addJob({
      name: name.trim(),
      expression: expression.trim(),
      command: command.trim(),
      cwd: selectedWorktree ?? process.env.HOME ?? '/',
      enabled: true,
    });
    setSubmitting(false);
    if (ok) {
      setName('');
      setCommand('');
      setExpression('*/5 * * * *');
      setShowForm(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '5px 6px',
    borderRadius: 4,
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: 12,
    outline: 'none',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minHeight: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={sectionTitleStyle}
        >
          Cron Jobs
        </span>
        {jobs.length > 0 && (
          <span
            style={{
              fontSize: 10,
              backgroundColor: 'var(--accent)',
              color: '#fff',
              borderRadius: 9999,
              padding: '0 6px',
              fontWeight: 600,
            }}
          >
            {jobs.length}
          </span>
        )}
        <span
          onClick={() => setShowForm(!showForm)}
          style={iconButtonStyle}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
          title="Add job"
        >
          +
        </span>
      </div>

      {/* Add form */}
      {showForm && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: 8,
            borderRadius: 6,
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Name</label>
            <input
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Build project"
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Command</label>
            <input
              style={inputStyle}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="e.g. npm run build"
            />
          </div>

          <CronExpressionInput value={expression} onChange={setExpression} />

          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                border: '1px solid var(--border-color)',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={submitting || !name.trim() || !command.trim()}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                border: 'none',
                backgroundColor: submitting ? 'var(--border-color)' : 'var(--accent)',
                color: '#fff',
                fontSize: 11,
                cursor: submitting ? 'default' : 'pointer',
              }}
            >
              {submitting ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* Job list */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {loading && (
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', padding: 4 }}>
            Loading...
          </span>
        )}

        {!loading && jobs.length === 0 && !showForm && (
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', padding: 4 }}>
            No jobs scheduled
          </span>
        )}

        {jobs.map((job) => (
          <CronJobItem
            key={job.id}
            job={job}
            onToggle={() => toggleJob(job.id)}
            onExecute={() => executeJob(job.id)}
            onRemove={() => removeJob(job.id)}
          />
        ))}
      </div>
    </div>
  );
}
