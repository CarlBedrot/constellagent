import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../main/ipc/constants';

contextBridge.exposeInMainWorld('api', {
  pty: {
    create: (cwd: string, shell?: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.PTY_CREATE, cwd, shell),

    write: (sessionId: string, data: string) =>
      ipcRenderer.send(IPC_CHANNELS.PTY_WRITE, sessionId, data),

    resize: (sessionId: string, cols: number, rows: number) =>
      ipcRenderer.send(IPC_CHANNELS.PTY_RESIZE, sessionId, cols, rows),

    destroy: (sessionId: string) =>
      ipcRenderer.send(IPC_CHANNELS.PTY_DESTROY, sessionId),

    onData: (callback: (sessionId: string, data: string) => void) => {
      ipcRenderer.on(
        IPC_CHANNELS.PTY_DATA,
        (_event, sessionId: string, data: string) => callback(sessionId, data)
      );
    },

    onExit: (callback: (sessionId: string, exitCode: number) => void) => {
      ipcRenderer.on(
        IPC_CHANNELS.PTY_EXIT,
        (_event, sessionId: string, exitCode: number) => callback(sessionId, exitCode)
      );
    },

    removeAllListeners: () => {
      ipcRenderer.removeAllListeners(IPC_CHANNELS.PTY_DATA);
      ipcRenderer.removeAllListeners(IPC_CHANNELS.PTY_EXIT);
    },
  },

  git: {
    selectDirectory: () =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_SELECT_DIRECTORY),

    isRepo: (dirPath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_IS_REPO, dirPath),

    listWorktrees: (repoPath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_LIST_WORKTREES, repoPath),

    addWorktree: (repoPath: string, path: string, branch: string, createBranch: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_ADD_WORKTREE, repoPath, path, branch, createBranch),

    removeWorktree: (repoPath: string, path: string, force: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_REMOVE_WORKTREE, repoPath, path, force),

    getStatus: (worktreePath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_GET_STATUS, worktreePath),

    getBranch: (worktreePath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_GET_BRANCH, worktreePath),

    listBranches: (repoPath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_LIST_BRANCHES, repoPath),

    getDiffFiles: (worktreePath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.GIT_GET_DIFF_FILES, worktreePath),
  },

  file: {
    read: (filePath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_READ, filePath),

    write: (filePath: string, content: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_WRITE, filePath, content),

    getOriginal: (repoPath: string, filePath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_GET_ORIGINAL, repoPath, filePath),

    addAllowedPath: (basePath: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_ADD_ALLOWED_PATH, basePath),
  },

  cron: {
    list: () =>
      ipcRenderer.invoke(IPC_CHANNELS.CRON_LIST),

    add: (params: {
      name: string;
      expression: string;
      command: string;
      cwd: string;
      enabled: boolean;
    }) => ipcRenderer.invoke(IPC_CHANNELS.CRON_ADD, params),

    update: (id: string, updates: Record<string, unknown>) =>
      ipcRenderer.invoke(IPC_CHANNELS.CRON_UPDATE, id, updates),

    remove: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.CRON_REMOVE, id),

    toggle: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.CRON_TOGGLE, id),

    execute: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.CRON_EXECUTE, id),

    onJobExecuted: (callback: (job: unknown) => void) => {
      ipcRenderer.on(
        IPC_CHANNELS.CRON_JOB_EXECUTED,
        (_event, job: unknown) => callback(job)
      );
    },

    removeAllListeners: () => {
      ipcRenderer.removeAllListeners(IPC_CHANNELS.CRON_JOB_EXECUTED);
    },
  },

  agent: {
    list: () =>
      ipcRenderer.invoke(IPC_CHANNELS.AGENT_LIST),

    launch: (params: { repoPath: string; command?: string }) =>
      ipcRenderer.invoke(IPC_CHANNELS.AGENT_LAUNCH, params),

    stop: (id: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.AGENT_STOP, id),

    onUpdated: (callback: (agent: unknown) => void) => {
      ipcRenderer.on(
        IPC_CHANNELS.AGENT_UPDATED,
        (_event, agent: unknown) => callback(agent)
      );
    },

    removeAllListeners: () => {
      ipcRenderer.removeAllListeners(IPC_CHANNELS.AGENT_UPDATED);
    },
  },

  layout: {
    get: () =>
      ipcRenderer.invoke(IPC_CHANNELS.LAYOUT_GET),

    save: (layout: Record<string, unknown>) =>
      ipcRenderer.invoke(IPC_CHANNELS.LAYOUT_SAVE, layout),
  },
});
