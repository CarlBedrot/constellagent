import type { DiffFile, DiffFileStatus } from '../../../preload/api-types';

interface FileTreeItemProps {
  file: DiffFile;
  isSelected: boolean;
  onSelect: () => void;
}

const STATUS_CONFIG: Record<DiffFileStatus, { label: string; color: string }> = {
  modified: { label: 'M', color: '#eab308' },
  added: { label: 'A', color: '#22c55e' },
  deleted: { label: 'D', color: '#ef4444' },
  untracked: { label: '?', color: '#71717a' },
};

export function FileTreeItem({ file, isSelected, onSelect }: FileTreeItemProps): React.JSX.Element {
  const cfg = STATUS_CONFIG[file.status];
  const fileName = file.path.split('/').pop() ?? file.path;
  const dirPath = file.path.includes('/') ? file.path.substring(0, file.path.lastIndexOf('/')) : '';

  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 8px',
        borderRadius: 4,
        backgroundColor: isSelected ? 'var(--bg-tertiary)' : 'transparent',
        cursor: 'pointer',
        transition: 'background-color 0.1s ease',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
      }}
      title={file.path}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: cfg.color,
          width: 14,
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        {cfg.label}
      </span>
      <span
        style={{
          fontSize: 12,
          color: 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {fileName}
      </span>
      {dirPath && (
        <span
          style={{
            fontSize: 10,
            color: 'var(--text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginLeft: 'auto',
            flexShrink: 0,
          }}
        >
          {dirPath}
        </span>
      )}
    </div>
  );
}
