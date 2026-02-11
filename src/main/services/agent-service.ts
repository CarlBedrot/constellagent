import { basename, dirname, join } from 'path';
import { mkdir, access } from 'fs/promises';
import { constants as fsConstants } from 'fs';
import { randomUUID } from 'crypto';
import { GitService } from './git-service';
import type { PtyManager } from './pty-manager';

export type AgentStatus = 'starting' | 'running' | 'stopping' | 'exited' | 'error';

export interface AgentSession {
  id: string;
  name: string;
  branch: string;
  worktreePath: string;
  sessionId: string;
  command: string;
  status: AgentStatus;
  startedAt: string;
  exitCode: number | null;
  lastOutput: string[];
  error?: string;
}

interface AgentInternal extends AgentSession {
  partialLine: string;
}

type UpdateCallback = (agent: AgentSession) => void;

export class AgentService {
  private agents = new Map<string, AgentInternal>();
  private updateCallback: UpdateCallback | null = null;
  private gitService = new GitService();

  constructor(private ptyManager: PtyManager) {}

  onUpdate(callback: UpdateCallback): void {
    this.updateCallback = callback;
  }

  listAgents(): AgentSession[] {
    return Array.from(this.agents.values()).map((agent) => this.toPublic(agent));
  }

  async launchAgent(params: { repoPath: string; command?: string }): Promise<AgentSession> {
    const command = params.command?.trim() || 'claude';
    const repoPath = params.repoPath;

    const repoName = basename(repoPath);
    const timestamp = this.formatTimestamp(new Date());
    const branch = `agent/${timestamp}`;

    const agentsRoot = join(dirname(repoPath), 'agents');
    await mkdir(agentsRoot, { recursive: true });

    const baseName = `${repoName}-agent-${timestamp}`;
    const worktreePath = await this.ensureUniquePath(agentsRoot, baseName);

    const agentId = randomUUID();
    const startedAt = new Date().toISOString();

    const agent: AgentInternal = {
      id: agentId,
      name: `Agent ${timestamp}`,
      branch,
      worktreePath,
      sessionId: '',
      command,
      status: 'starting',
      startedAt,
      exitCode: null,
      lastOutput: [],
      partialLine: '',
    };

    this.agents.set(agentId, agent);
    this.notify(agent);

    try {
      await this.gitService.addWorktree(repoPath, worktreePath, branch, true);

      const session = this.ptyManager.create(worktreePath);
      agent.sessionId = session.id;
      agent.status = 'running';
      this.notify(agent);

      this.ptyManager.onData(session.id, (_sessionId, data) => {
        this.handleOutput(agentId, data);
      });

      this.ptyManager.onExit(session.id, (_sessionId, exitCode) => {
        const current = this.agents.get(agentId);
        if (!current) return;
        current.status = 'exited';
        current.exitCode = exitCode ?? null;
        this.notify(current);
      });

      // Kick off the agent command immediately.
      this.ptyManager.write(session.id, `${command}\n`);
      return this.toPublic(agent);
    } catch (error) {
      agent.status = 'error';
      agent.error = error instanceof Error ? error.message : 'Failed to launch agent';
      this.notify(agent);
      throw error;
    }
  }

  stopAgent(id: string): boolean {
    const agent = this.agents.get(id);
    if (!agent || !agent.sessionId) return false;
    agent.status = 'stopping';
    this.notify(agent);
    this.ptyManager.destroy(agent.sessionId);
    return true;
  }

  private handleOutput(id: string, chunk: string): void {
    const agent = this.agents.get(id);
    if (!agent) return;

    const cleaned = this.stripAnsi(chunk);
    const combined = agent.partialLine + cleaned;
    const parts = combined.split(/\r?\n/);
    agent.partialLine = parts.pop() ?? '';

    let didUpdate = false;
    for (const line of parts) {
      const trimmed = line.trimEnd();
      if (!trimmed) continue;
      agent.lastOutput.push(trimmed);
      if (agent.lastOutput.length > 2) {
        agent.lastOutput.shift();
      }
      didUpdate = true;
    }

    if (didUpdate) {
      this.notify(agent);
    }
  }

  private notify(agent: AgentInternal): void {
    if (this.updateCallback) {
      this.updateCallback(this.toPublic(agent));
    }
  }

  private toPublic(agent: AgentInternal): AgentSession {
    const { partialLine, ...publicAgent } = agent;
    return publicAgent;
  }

  private stripAnsi(text: string): string {
    return text.replace(/\x1B\[[0-9;]*m/g, '');
  }

  private formatTimestamp(date: Date): string {
    const pad = (value: number) => value.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    return `${year}${month}${day}-${hour}${minute}`;
  }

  private async ensureUniquePath(root: string, baseName: string): Promise<string> {
    let candidate = join(root, baseName);
    let counter = 1;
    while (await this.pathExists(candidate)) {
      candidate = join(root, `${baseName}-${counter}`);
      counter += 1;
    }
    return candidate;
  }

  private async pathExists(path: string): Promise<boolean> {
    try {
      await access(path, fsConstants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
}
