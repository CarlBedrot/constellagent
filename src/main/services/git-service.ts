import simpleGit, { type SimpleGit } from 'simple-git';
import { existsSync } from 'fs';
import { join, basename } from 'path';

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

export class GitService {
  private getGit(repoPath: string): SimpleGit {
    return simpleGit(repoPath);
  }

  async isGitRepo(dirPath: string): Promise<boolean> {
    try {
      const git = this.getGit(dirPath);
      return await git.checkIsRepo();
    } catch {
      return false;
    }
  }

  async listWorktrees(repoPath: string): Promise<WorktreeInfo[]> {
    const git = this.getGit(repoPath);
    const raw = await git.raw(['worktree', 'list', '--porcelain']);
    return this.parseWorktreeOutput(raw);
  }

  async addWorktree(
    repoPath: string,
    path: string,
    branch: string,
    createBranch: boolean
  ): Promise<void> {
    const git = this.getGit(repoPath);
    const args = ['worktree', 'add'];
    if (createBranch) {
      args.push('-b', branch, path);
    } else {
      args.push(path, branch);
    }
    await git.raw(args);
  }

  async removeWorktree(repoPath: string, path: string, force: boolean): Promise<void> {
    const git = this.getGit(repoPath);
    const args = ['worktree', 'remove'];
    if (force) {
      args.push('--force');
    }
    args.push(path);
    await git.raw(args);
  }

  async getStatus(worktreePath: string): Promise<GitStatus> {
    const git = this.getGit(worktreePath);
    const status = await git.status();
    return {
      modified: status.modified,
      staged: status.staged,
      untracked: status.not_added,
    };
  }

  async getCurrentBranch(worktreePath: string): Promise<string> {
    const git = this.getGit(worktreePath);
    const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
    return branch.trim();
  }

  async getDiffFiles(worktreePath: string): Promise<DiffFile[]> {
    const git = this.getGit(worktreePath);
    const status = await git.status();
    const files: DiffFile[] = [];

    for (const f of status.staged) {
      files.push({
        path: f,
        absolutePath: `${worktreePath}/${f}`,
        status: 'added',
      });
    }

    for (const f of status.modified) {
      if (!files.some((df) => df.path === f)) {
        files.push({
          path: f,
          absolutePath: `${worktreePath}/${f}`,
          status: 'modified',
        });
      }
    }

    for (const f of status.deleted) {
      files.push({
        path: f,
        absolutePath: `${worktreePath}/${f}`,
        status: 'deleted',
      });
    }

    for (const f of status.not_added) {
      files.push({
        path: f,
        absolutePath: `${worktreePath}/${f}`,
        status: 'untracked',
      });
    }

    return files;
  }

  async listBranches(repoPath: string): Promise<string[]> {
    const git = this.getGit(repoPath);
    const result = await git.branchLocal();
    return result.all;
  }

  private parseWorktreeOutput(raw: string): WorktreeInfo[] {
    const worktrees: WorktreeInfo[] = [];
    const blocks = raw.trim().split('\n\n');

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      let path = '';
      let branch = '';
      let isBare = false;

      for (const line of lines) {
        if (line.startsWith('worktree ')) {
          path = line.substring('worktree '.length);
        } else if (line.startsWith('branch ')) {
          branch = line.substring('branch '.length).replace('refs/heads/', '');
        } else if (line === 'bare') {
          isBare = true;
        } else if (line === 'detached') {
          branch = '(detached)';
        }
      }

      if (path) {
        worktrees.push({ path, branch, isMain: worktrees.length === 0, isBare });
      }
    }

    return worktrees;
  }
}
