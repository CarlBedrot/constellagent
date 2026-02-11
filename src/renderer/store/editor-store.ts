import { create } from 'zustand';
import type { DiffFile } from '../../preload/api-types';

interface OpenFile {
  path: string;
  absolutePath: string;
  content: string;
  originalContent: string;
}

interface EditorState {
  openFile: OpenFile | null;
  isDiffMode: boolean;
  diffFiles: DiffFile[];
  loading: boolean;

  loadDiffFiles: (worktreePath: string) => Promise<void>;
  openFileForEdit: (worktreePath: string, file: DiffFile) => Promise<void>;
  toggleDiffMode: () => void;
  saveFile: () => Promise<boolean>;
  closeFile: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  openFile: null,
  isDiffMode: true,
  diffFiles: [],
  loading: false,

  loadDiffFiles: async (worktreePath: string) => {
    set({ loading: true });
    const result = await window.api.git.getDiffFiles(worktreePath);
    if (result.success) {
      set({ diffFiles: result.data, loading: false });
    } else {
      set({ diffFiles: [], loading: false });
    }
  },

  openFileForEdit: async (worktreePath: string, file: DiffFile) => {
    // Register the worktree as an allowed path for file operations
    await window.api.file.addAllowedPath(worktreePath);

    const readResult = await window.api.file.read(file.absolutePath);
    if (!readResult.success) return;

    const origResult = await window.api.file.getOriginal(worktreePath, file.absolutePath);
    const originalContent = origResult.success ? origResult.data.content : '';

    set({
      openFile: {
        path: file.path,
        absolutePath: file.absolutePath,
        content: readResult.data.content,
        originalContent,
      },
    });
  },

  toggleDiffMode: () => set((s) => ({ isDiffMode: !s.isDiffMode })),

  saveFile: async () => {
    const { openFile } = get();
    if (!openFile) return false;
    const result = await window.api.file.write(openFile.absolutePath, openFile.content);
    return result.success;
  },

  closeFile: () => set({ openFile: null }),
}));
