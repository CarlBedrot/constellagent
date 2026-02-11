interface CronExpressionInputProps {
  value: string;
  onChange: (value: string) => void;
}

const PRESETS: Array<{ label: string; expression: string }> = [
  { label: 'Every minute', expression: '* * * * *' },
  { label: 'Every 5 minutes', expression: '*/5 * * * *' },
  { label: 'Every 15 minutes', expression: '*/15 * * * *' },
  { label: 'Every hour', expression: '0 * * * *' },
  { label: 'Every day at midnight', expression: '0 0 * * *' },
  { label: 'Every Monday at 9am', expression: '0 9 * * 1' },
  { label: 'Custom', expression: '' },
];

function describeExpression(expr: string): string {
  const preset = PRESETS.find((p) => p.expression === expr);
  if (preset && preset.label !== 'Custom') return preset.label;

  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return 'Invalid expression';

  return `Cron: ${expr}`;
}

export function CronExpressionInput({ value, onChange }: CronExpressionInputProps): React.JSX.Element {
  const isCustom = !PRESETS.some((p) => p.expression === value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Schedule</label>
      <select
        value={isCustom ? '' : value}
        onChange={(e) => {
          const selected = e.target.value;
          if (selected === '') return; // Custom selected, keep current value
          onChange(selected);
        }}
        style={{
          width: '100%',
          padding: '5px 6px',
          borderRadius: 4,
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          fontSize: 12,
          outline: 'none',
        }}
      >
        {PRESETS.map((p) => (
          <option key={p.label} value={p.expression}>
            {p.label}
          </option>
        ))}
      </select>

      {(isCustom || value === '') && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="* * * * *"
          style={{
            width: '100%',
            padding: '5px 6px',
            borderRadius: 4,
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontSize: 12,
            fontFamily: 'monospace',
            outline: 'none',
          }}
        />
      )}

      <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
        {describeExpression(value)}
      </span>
    </div>
  );
}
