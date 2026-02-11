import { ipcMain, dialog, type BrowserWindow } from 'electron';
import { IPC_CHANNELS } from './constants';
import { GitService } from '../services/git-service';

export function registerGitHandlers(mainWindow: BrowserWindow): void {
  const gitService = new GitService();

  ipcMain.handle(IPC_CHANNELS.GIT_SELECT_DIRECTORY, async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: 'Select Git Repository',
      });
      if (result.canceled || result.filePaths.length === 0) {
        return { success: true as const, data: { path: null } };
      }
      const dirPath = result.filePaths[0];
      const isRepo = await gitService.isGitRepo(dirPath);
      if (!isRepo) {
        return { success: false as const, error: 'Selected directory is not a Git repository' };
      }
      return { success: true as const, data: { path: dirPath } };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Failed to select directory',
      };
    }
  });

  ipcMain.handle(IPC_CHANNELS.GIT_IS_REPO, async (_event, dirPath: string) => {
    try {
      const isRepo = await gitService.isGitRepo(dirPath);
      return { success: true as const, data: { isRepo } };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Failed to check repo',
      };
    }
  });

  ipcMain.handle(IPC_CHANNELS.GIT_LIST_WORKTREES, async (_event, repoPath: string) => {
    try {
      const worktrees = await gitService.listWorktrees(repoPath);
      return { success: true as const, data: worktrees };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Failed to list worktrees',
      };
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.GIT_ADD_WORKTREE,
    async (
      _event,
      repoPath: string,
      path: string,
      branch: string,
      createBranch: boolean
    ) => {
      try {
        await gitService.addWorktree(repoPath, path, branch, createBranch);
        return { success: true as const, data: null };
      } catch (error) {
        return {
          success: false as const,
          error: error instanceof Error ? error.message : 'Failed to add worktree',
        };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.GIT_REMOVE_WORKTREE,
    async (_event, repoPath: string, path: string, force: boolean) => {
      try {
        await gitService.removeWorktree(repoPath, path, force);
        return { success: true as const, data: null };
      } catch (error) {
        return {
          success: false as const,
          error: error instanceof Error ? error.message : 'Failed to remove worktree',
        };
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.GIT_GET_STATUS, async (_event, worktreePath: string) => {
    try {
      const status = await gitService.getStatus(worktreePath);
      return { success: true as const, data: status };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Failed to get status',
      };
    }
  });

  ipcMain.handle(IPC_CHANNELS.GIT_GET_BRANCH, async (_event, worktreePath: string) => {
    try {
      const branch = await gitService.getCurrentBranch(worktreePath);
      return { success: true as const, data: { branch } };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Failed to get branch',
      };
    }
  });

  ipcMain.handle(IPC_CHANNELS.GIT_GET_DIFF_FILES, async (_event, worktreePath: string) => {
    try {
      const files = await gitService.getDiffFiles(worktreePath);
      return { success: true as const, data: files };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Failed to get diff files',
      };
    }
  });

  ipcMain.handle(IPC_CHANNELS.GIT_LIST_BRANCHES, async (_event, repoPath: string) => {
    try {
      const branches = await gitService.listBranches(repoPath);
      return { success: true as const, data: branches };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Failed to list branches',
      };
    }
  });
}
