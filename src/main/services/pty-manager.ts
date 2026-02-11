import * as pty from 'node-pty';
import { platform } from 'os';

interface PtySession {
  id: string;
  process: pty.IPty;
  cwd: string;
}

type DataCallback = (sessionId: string, data: string) => void;
type ExitCallback = (sessionId: string, exitCode: number) => void;

export class PtyManager {
  private sessions = new Map<string, PtySession>();
  private dataListeners = new Map<string, Set<DataCallback>>();
  private exitListeners = new Map<string, Set<ExitCallback>>();
  private nextId = 1;

  create(cwd: string, shell?: string): { id: string } {
    const id = `pty-${this.nextId++}`;
    const defaultShell =
      shell ?? (platform() === 'win32' ? 'powershell.exe' : process.env.SHELL ?? '/bin/zsh');

    const proc = pty.spawn(defaultShell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd,
      env: { ...process.env } as Record<string, string>,
    });

    const session: PtySession = { id, process: proc, cwd };
    this.sessions.set(id, session);

    proc.onData((data: string) => {
      const listeners = this.dataListeners.get(id);
      if (!listeners) return;
      for (const cb of listeners) {
        cb(id, data);
      }
    });

    proc.onExit(({ exitCode }) => {
      const listeners = this.exitListeners.get(id);
      if (listeners) {
        for (const cb of listeners) {
          cb(id, exitCode);
        }
      }
      this.cleanup(id);
    });

    return { id };
  }

  write(sessionId: string, data: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.process.write(data);
    }
  }

  resize(sessionId: string, cols: number, rows: number): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.process.resize(cols, rows);
    }
  }

  destroy(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.process.kill();
      this.cleanup(sessionId);
    }
  }

  onData(sessionId: string, callback: DataCallback): void {
    const listeners = this.dataListeners.get(sessionId) ?? new Set<DataCallback>();
    listeners.add(callback);
    this.dataListeners.set(sessionId, listeners);
  }

  onExit(sessionId: string, callback: ExitCallback): void {
    const listeners = this.exitListeners.get(sessionId) ?? new Set<ExitCallback>();
    listeners.add(callback);
    this.exitListeners.set(sessionId, listeners);
  }

  destroyAll(): void {
    for (const [id] of this.sessions) {
      this.destroy(id);
    }
  }

  private cleanup(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.dataListeners.delete(sessionId);
    this.exitListeners.delete(sessionId);
  }
}
