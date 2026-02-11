import { useEffect } from 'react';
import { useEditorStore } from '@renderer/store/editor-store';
import { useWorktreeStore } from '@renderer/store/worktree-store';
import { FileTreeItem } from './FileTreeItem';
import type { DiffFile, DiffFileStatus } from '../../../preload/api-types';

const GROUP_ORDER: DiffFileStatus[] = ['added', 'modified', 'deleted', 'untracked'];

const GROUP_LABELS: Record<DiffFileStatus, string> = {
  added: 'Staged',
  modified: 'Modified',
  deleted: 'Deleted',
  untracked: 'Untracked',
};

export function FileTree(): React.JSX.Element {
  const selectedWorktree = useWorktreeStore((s) => s.selectedWorktree);
  const diffFiles = useEditorStore((s) => s.diffFiles);
  const loading = useEditorStore((s) => s.loading);
  const openFile = useEditorStore((s) => s.openFile);
  const loadDiffFiles = useEditorStore((s) => s.loadDiffFiles);
  const openFileForEdit = useEditorStore((s) => s.openFileForEdit);

  useEffect(() => {
    if (selectedWorktree) {
      loadDiffFiles(selectedWorktree);
    }
  }, [selectedWorktree, loadDiffFiles]);

  const grouped = GROUP_ORDER.map((status) => ({
    status,
    label: GROUP_LABELS[status],
    files: diffFiles.filter((f) => f.status === status),
  })).filter((g) => g.files.length > 0);

  const handleSelect = (file: DiffFile) => {
    if (selectedWorktree) {
      openFileForEdit(selectedWorktree, file);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'auto',
        gap: 2,
      }}
    >
      {!selectedWorktree && (
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', padding: 8 }}>
          Select a worktree to view changes
        </span>
      )}

      {loading && (
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', padding: 8 }}>
          Loading...
        </span>
      )}

      {!loading && selectedWorktree && diffFiles.length === 0 && (
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', padding: 8 }}>
          No changes
        </span>
      )}

      {grouped.map((group) => (
        <div key={group.status}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-secondary)',
              padding: '6px 8px 2px',
            }}
          >
            {group.label} ({group.files.length})
          </div>
          {group.files.map((file) => (
            <FileTreeItem
              key={file.path}
              file={file}
              isSelected={openFile?.absolutePath === file.absolutePath}
              onSelect={() => handleSelect(file)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
