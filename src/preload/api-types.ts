export interface IpcResult<T> {
  success: true;
  data: T;
}

export interface IpcError {
  success: false;
  error: string;
}

export type IpcResponse<T> = IpcResult<T> | IpcError;

export interface WorktreeInfo {
  path: string;
  branch: string;
  isMain: boolean;
  isBare: boolean;
}

export interface GitStatus {
  modified: string[];
  staged: string[];
  untracked: string[];
}

export type DiffFileStatus = 'modified' | 'added' | 'deleted' | 'untracked';

export interface DiffFile {
  path: string;
  absolutePath: string;
  status: DiffFileStatus;
}

export interface CronJob {
  id: string;
  name: string;
  expression: string;
  command: string;
  cwd: string;
  enabled: boolean;
  lastRun: string | null;
  nextRun: string | null;
}

export interface LayoutConfig {
  sidebarSize: number;
  terminalSize: number;
  editorSize: number;
  lastRepoPath: string | null;
  windowBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
    isMaximized: boolean;
  } | null;
}

export interface ElectronAPI {
  pty: {
    create(cwd?: string, shell?: string): Promise<IpcResponse<{ sessionId: string }>>;
    write(sessionId: string, data: string): void;
    resize(sessionId: string, cols: number, rows: number): void;
    destroy(sessionId: string): void;
    onData(callback: (sessionId: string, data: string) => void): void;
    onExit(callback: (sessionId: string, exitCode: number) => void): void;
    removeAllListeners(): void;
  };
  git: {
    selectDirectory(): Promise<IpcResponse<{ path: string | null }>>;
    isRepo(dirPath: string): Promise<IpcResponse<{ isRepo: boolean }>>;
    listWorktrees(repoPath: string): Promise<IpcResponse<WorktreeInfo[]>>;
    addWorktree(
      repoPath: string,
      path: string,
      branch: string,
      createBranch: boolean
    ): Promise<IpcResponse<null>>;
    removeWorktree(repoPath: string, path: string, force: boolean): Promise<IpcResponse<null>>;
    getStatus(worktreePath: string): Promise<IpcResponse<GitStatus>>;
    getBranch(worktreePath: string): Promise<IpcResponse<{ branch: string }>>;
    listBranches(repoPath: string): Promise<IpcResponse<string[]>>;
    getDiffFiles(worktreePath: string): Promise<IpcResponse<DiffFile[]>>;
  };
  file: {
    read(filePath: string): Promise<IpcResponse<{ content: string }>>;
    write(filePath: string, content: string): Promise<IpcResponse<null>>;
    getOriginal(repoPath: string, filePath: string): Promise<IpcResponse<{ content: string }>>;
    addAllowedPath(basePath: string): Promise<IpcResponse<null>>;
  };
  cron: {
    list(): Promise<IpcResponse<CronJob[]>>;
    add(params: {
      name: string;
      expression: string;
      command: string;
      cwd: string;
      enabled: boolean;
    }): Promise<IpcResponse<CronJob>>;
    update(id: string, updates: Partial<CronJob>): Promise<IpcResponse<CronJob>>;
    remove(id: string): Promise<IpcResponse<null>>;
    toggle(id: string): Promise<IpcResponse<CronJob>>;
    execute(id: string): Promise<IpcResponse<CronJob>>;
    onJobExecuted(callback: (job: CronJob) => void): void;
    removeAllListeners(): void;
  };
  layout: {
    get(): Promise<IpcResponse<LayoutConfig>>;
    save(layout: Partial<LayoutConfig>): Promise<IpcResponse<null>>;
  };
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
