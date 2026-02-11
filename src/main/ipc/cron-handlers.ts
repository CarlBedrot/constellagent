import { ipcMain, type BrowserWindow } from 'electron';
import { IPC_CHANNELS } from './constants';
import { CronService } from '../services/cron-service';
import type { AgentService } from '../services/agent-service';

export function registerCronHandlers(
  mainWindow: BrowserWindow,
  agentService?: AgentService
): CronService {
  const cronService = new CronService();

  // Notify renderer when a cron job executes
  cronService.onExecute((job) => {
    if (job.kind === 'agent' && agentService && job.repoPath) {
      agentService
        .launchAgent({ repoPath: job.repoPath, command: job.command })
        .catch((error) => {
          console.error('Failed to launch agent from cron job:', error);
        });
    }
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(IPC_CHANNELS.CRON_JOB_EXECUTED, job);
    }
  });

  // Schedule all enabled jobs on startup
  cronService.scheduleAllEnabled();

  ipcMain.handle(IPC_CHANNELS.CRON_LIST, async () => {
    try {
      const jobs = cronService.listJobs();
      return { success: true as const, data: jobs };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Failed to list jobs',
      };
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.CRON_ADD,
    async (
      _event,
      params: {
        name: string;
        kind?: 'command' | 'agent';
        expression: string;
        command: string;
        cwd: string;
        repoPath?: string | null;
        enabled: boolean;
      }
    ) => {
      try {
        const job = cronService.addJob(params);
        return { success: true as const, data: job };
      } catch (error) {
        return {
          success: false as const,
          error: error instanceof Error ? error.message : 'Failed to add job',
        };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.CRON_UPDATE,
    async (_event, id: string, updates: Record<string, unknown>) => {
      try {
        const job = cronService.updateJob(id, updates);
        if (!job) return { success: false as const, error: 'Job not found' };
        return { success: true as const, data: job };
      } catch (error) {
        return {
          success: false as const,
          error: error instanceof Error ? error.message : 'Failed to update job',
        };
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.CRON_REMOVE, async (_event, id: string) => {
    try {
      const ok = cronService.removeJob(id);
      if (!ok) return { success: false as const, error: 'Job not found' };
      return { success: true as const, data: null };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Failed to remove job',
      };
    }
  });

  ipcMain.handle(IPC_CHANNELS.CRON_TOGGLE, async (_event, id: string) => {
    try {
      const job = cronService.toggleJob(id);
      if (!job) return { success: false as const, error: 'Job not found' };
      return { success: true as const, data: job };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Failed to toggle job',
      };
    }
  });

  ipcMain.handle(IPC_CHANNELS.CRON_EXECUTE, async (_event, id: string) => {
    try {
      const job = cronService.executeJob(id);
      if (!job) return { success: false as const, error: 'Job not found' };
      return { success: true as const, data: job };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Failed to execute job',
      };
    }
  });

  return cronService;
}
