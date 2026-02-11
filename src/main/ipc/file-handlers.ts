import { ipcMain } from 'electron';
import { IPC_CHANNELS } from './constants';
import { FileService } from '../services/file-service';

export function registerFileHandlers(): FileService {
  const fileService = new FileService();

  ipcMain.handle(IPC_CHANNELS.FILE_READ, async (_event, filePath: string) => {
    try {
      const content = await fileService.readFile(filePath);
      return { success: true as const, data: { content } };
    } catch (error) {
      return {
        success: false as const,
        error: error instanceof Error ? error.message : 'Failed to read file',
      };
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.FILE_WRITE,
    async (_event, filePath: string, content: string) => {
      try {
        await fileService.writeFile(filePath, content);
        return { success: true as const, data: null };
      } catch (error) {
        return {
          success: false as const,
          error: error instanceof Error ? error.message : 'Failed to write file',
        };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.FILE_GET_ORIGINAL,
    async (_event, repoPath: string, filePath: string) => {
      try {
        const content = await fileService.getOriginalContent(repoPath, filePath);
        return { success: true as const, data: { content } };
      } catch (error) {
        return {
          success: false as const,
          error: error instanceof Error ? error.message : 'Failed to get original content',
        };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.FILE_ADD_ALLOWED_PATH,
    async (_event, basePath: string) => {
      fileService.addAllowedPath(basePath);
      return { success: true as const, data: null };
    }
  );

  return fileService;
}
