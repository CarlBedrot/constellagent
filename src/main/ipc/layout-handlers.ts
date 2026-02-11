import { ipcMain } from 'electron';
import { IPC_CHANNELS } from './constants';
import type { LayoutService, LayoutConfig } from '../services/layout-service';

export function registerLayoutHandlers(layoutService: LayoutService): void {
  ipcMain.handle(IPC_CHANNELS.LAYOUT_GET, () => {
    try {
      return { success: true, data: layoutService.getLayout() };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });

  ipcMain.handle(IPC_CHANNELS.LAYOUT_SAVE, (_event, layout: Partial<LayoutConfig>) => {
    try {
      layoutService.saveLayout(layout);
      return { success: true, data: null };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  });
}
