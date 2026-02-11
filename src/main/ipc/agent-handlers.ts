import { ipcMain, type BrowserWindow } from 'electron';
import { IPC_CHANNELS } from './constants';
import { AgentService } from '../services/agent-service';
import type { PtyManager } from '../services/pty-manager';

export function registerAgentHandlers(
  mainWindow: BrowserWindow,
  ptyManager: PtyManager
): AgentService {
  const agentService = new AgentService(ptyManager);

  agentService.onUpdate((agent) => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.AGENT_UPDATED, agent);
    }
  });

  ipcMain.handle(IPC_CHANNELS.AGENT_LIST, async () => {
    try {
      const agents = agentService.listAgents();
      return { success: true as const, data: agents };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Failed to list agents',
      };
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.AGENT_LAUNCH,
    async (_event, params: { repoPath: string; command?: string }) => {
      try {
        const agent = await agentService.launchAgent(params);
        return { success: true as const, data: agent };
      } catch (error) {
        return {
          success: false as const,
          error: error instanceof Error ? error.message : 'Failed to launch agent',
        };
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.AGENT_STOP, async (_event, id: string) => {
    try {
      const ok = agentService.stopAgent(id);
      if (!ok) return { success: false as const, error: 'Agent not found' };
      return { success: true as const, data: null };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Failed to stop agent',
      };
    }
  });

  ipcMain.handle(IPC_CHANNELS.AGENT_RESTART, async (_event, id: string) => {
    try {
      const agent = await agentService.restartAgent(id);
      if (!agent) return { success: false as const, error: 'Agent not found' };
      return { success: true as const, data: agent };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Failed to restart agent',
      };
    }
  });

  ipcMain.handle(IPC_CHANNELS.AGENT_REMOVE, async (_event, id: string) => {
    try {
      const ok = agentService.removeAgent(id);
      if (!ok) return { success: false as const, error: 'Agent is still running' };
      return { success: true as const, data: null };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Failed to remove agent',
      };
    }
  });

  return agentService;
}
