import { create } from 'zustand';
import type { WorktreeInfo } from '../../preload/api-types';

interface WorktreeState {
  repoPath: string | null;
  worktrees: WorktreeInfo[];
  selectedWorktree: string | null;
  loading: boolean;
  error: string | null;

  setRepoPath: (path: string | null) => void;
  loadWorktrees: () => Promise<void>;
  addWorktree: (path: string, branch: string, createBranch: boolean) => Promise<boolean>;
  removeWorktree: (path: string, force: boolean) => Promise<boolean>;
  selectWorktree: (path: string | null) => void;
}

export const useWorktreeStore = create<WorktreeState>((set, get) => ({
  repoPath: null,
  worktrees: [],
  selectedWorktree: null,
  loading: false,
  error: null,

  setRepoPath: (path) => {
    set({ repoPath: path, worktrees: [], selectedWorktree: null, error: null });
    if (path) {
      get().loadWorktrees();
    }
  },

  loadWorktrees: async () => {
    const { repoPath } = get();
    if (!repoPath) return;

    set({ loading: true, error: null });
    try {
      const result = await window.api.git.listWorktrees(repoPath);
      if (result.success) {
        const worktrees = result.data;
        const { selectedWorktree } = get();
        const stillExists = worktrees.some((w) => w.path === selectedWorktree);
        set({
          worktrees,
          loading: false,
          selectedWorktree: stillExists ? selectedWorktree : worktrees[0]?.path ?? null,
        });
      } else {
        set({ error: result.error, loading: false });
      }
    } catch {
      set({ error: 'Failed to load worktrees', loading: false });
    }
  },

  addWorktree: async (path, branch, createBranch) => {
    const { repoPath } = get();
    if (!repoPath) return false;

    const result = await window.api.git.addWorktree(repoPath, path, branch, createBranch);
    if (result.success) {
      await get().loadWorktrees();
      return true;
    }
    set({ error: result.error });
    return false;
  },

  removeWorktree: async (path, force) => {
    const { repoPath } = get();
    if (!repoPath) return false;

    const result = await window.api.git.removeWorktree(repoPath, path, force);
    if (result.success) {
      await get().loadWorktrees();
      return true;
    }
    set({ error: result.error });
    return false;
  },

  selectWorktree: (path) => set({ selectedWorktree: path }),
}));
