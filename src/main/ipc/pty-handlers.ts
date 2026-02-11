import { ipcMain, type BrowserWindow } from 'electron';
import { homedir } from 'os';
import { IPC_CHANNELS } from './constants';
import { PtyManager } from '../services/pty-manager';

export function registerPtyHandlers(mainWindow: BrowserWindow): PtyManager {
  const ptyManager = new PtyManager();

  ipcMain.handle(
    IPC_CHANNELS.PTY_CREATE,
    async (_event, cwd?: string, shell?: string) => {
      try {
        const resolvedCwd = cwd && cwd !== '/' ? cwd : homedir();
        const session = ptyManager.create(resolvedCwd, shell);

        ptyManager.onData(session.id, (sessionId: string, data: string) => {
          if (!mainWindow.isDestroyed()) {
            mainWindow.webContents.send(IPC_CHANNELS.PTY_DATA, sessionId, data);
          }
        });

        ptyManager.onExit(session.id, (sessionId: string, exitCode: number) => {
          if (!mainWindow.isDestroyed()) {
            mainWindow.webContents.send(IPC_CHANNELS.PTY_EXIT, sessionId, exitCode);
          }
        });

        return { success: true as const, data: { sessionId: session.id } };
      } catch (error) {
        return {
          success: false as const,
          error: error instanceof Error ? error.message : 'Failed to create PTY',
        };
      }
    }
  );

  ipcMain.on(
    IPC_CHANNELS.PTY_WRITE,
    (_event, sessionId: string, data: string) => {
      ptyManager.write(sessionId, data);
    }
  );

  ipcMain.on(
    IPC_CHANNELS.PTY_RESIZE,
    (_event, sessionId: string, cols: number, rows: number) => {
      ptyManager.resize(sessionId, cols, rows);
    }
  );

  ipcMain.on(IPC_CHANNELS.PTY_DESTROY, (_event, sessionId: string) => {
    ptyManager.destroy(sessionId);
  });

  return ptyManager;
}
