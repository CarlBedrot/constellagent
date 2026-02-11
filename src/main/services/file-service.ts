import { readFile as fsReadFile, writeFile as fsWriteFile } from 'fs/promises';
import { relative } from 'path';
import simpleGit from 'simple-git';
import { validatePath } from '../utils/path-validator';

export class FileService {
  private allowedPaths: string[] = [];

  addAllowedPath(basePath: string): void {
    if (!this.allowedPaths.includes(basePath)) {
      this.allowedPaths.push(basePath);
    }
  }

  async readFile(filePath: string): Promise<string> {
    const resolved = validatePath(filePath, this.allowedPaths);
    return fsReadFile(resolved, 'utf-8');
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    const resolved = validatePath(filePath, this.allowedPaths);
    await fsWriteFile(resolved, content, 'utf-8');
  }

  async getOriginalContent(repoPath: string, filePath: string): Promise<string> {
    validatePath(filePath, this.allowedPaths);
    const rel = relative(repoPath, filePath);
    const git = simpleGit(repoPath);
    try {
      return await git.show([`HEAD:${rel}`]);
    } catch {
      return '';
    }
  }
}
