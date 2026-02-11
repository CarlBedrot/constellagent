type DataCallback = (data: string) => void;
type ExitCallback = (exitCode: number) => void;

class PtyBus {
  private dataListeners = new Map<string, DataCallback>();
  private exitListeners = new Map<string, ExitCallback>();
  private initialized = false;

  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    window.api.pty.onData((sessionId: string, data: string) => {
      const cb = this.dataListeners.get(sessionId);
      if (cb) cb(data);
    });

    window.api.pty.onExit((sessionId: string, exitCode: number) => {
      const cb = this.exitListeners.get(sessionId);
      if (cb) cb(exitCode);
    });
  }

  onData(sessionId: string, callback: DataCallback): void {
    this.init();
    this.dataListeners.set(sessionId, callback);
  }

  onExit(sessionId: string, callback: ExitCallback): void {
    this.init();
    this.exitListeners.set(sessionId, callback);
  }

  offData(sessionId: string): void {
    this.dataListeners.delete(sessionId);
  }

  offExit(sessionId: string): void {
    this.exitListeners.delete(sessionId);
  }
}

export const ptyBus = new PtyBus();
