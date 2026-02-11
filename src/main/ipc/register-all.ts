import type { BrowserWindow } from 'electron';
import { registerPtyHandlers } from './pty-handlers';
import { registerGitHandlers } from './git-handlers';
import { registerFileHandlers } from './file-handlers';
import { registerCronHandlers } from './cron-handlers';
import { registerLayoutHandlers } from './layout-handlers';
import type { PtyManager } from '../services/pty-manager';
import type { FileService } from '../services/file-service';
import type { CronService } from '../services/cron-service';
import type { LayoutService } from '../services/layout-service';

interface RegisteredServices {
  ptyManager: PtyManager;
  fileService: FileService;
  cronService: CronService;
  layoutService: LayoutService;
}

export function registerAllHandlers(
  mainWindow: BrowserWindow,
  layoutService: LayoutService
): RegisteredServices {
  const ptyManager = registerPtyHandlers(mainWindow);
  registerGitHandlers(mainWindow);
  const fileService = registerFileHandlers();
  const cronService = registerCronHandlers(mainWindow);
  registerLayoutHandlers(layoutService);

  return { ptyManager, fileService, cronService, layoutService };
}
