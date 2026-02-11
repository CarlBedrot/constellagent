import { app, BrowserWindow, shell, screen } from 'electron';
import { join } from 'path';
import { registerAllHandlers } from './ipc/register-all';
import { LayoutService } from './services/layout-service';

const isDev = !app.isPackaged;

// Create layout service early so we can read window bounds before creating window
const layoutService = new LayoutService();

type Services = ReturnType<typeof registerAllHandlers>;
let services: Services | null = null;

function createWindow(): void {
  const savedBounds = layoutService.getWindowBounds();

  let windowOpts: Electron.BrowserWindowConstructorOptions = {
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'Constellagent',
    backgroundColor: '#0a0a0a',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 10 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  };

  if (savedBounds) {
    const displays = screen.getAllDisplays();
    const visible = displays.some((display) => {
      const { x, y, width, height } = display.bounds;
      return (
        savedBounds.x >= x - 100 &&
        savedBounds.x <= x + width - 100 &&
        savedBounds.y >= y - 100 &&
        savedBounds.y <= y + height - 100
      );
    });

    if (visible) {
      windowOpts = {
        ...windowOpts,
        x: savedBounds.x,
        y: savedBounds.y,
        width: savedBounds.width,
        height: savedBounds.height,
      };
    }
  }

  const mainWindow = new BrowserWindow(windowOpts);

  services = registerAllHandlers(mainWindow, layoutService);

  if (savedBounds?.isMaximized) {
    mainWindow.maximize();
  }

  // Save window bounds on move/resize
  const saveBounds = (): void => {
    if (mainWindow.isDestroyed()) return;
    const isMaximized = mainWindow.isMaximized();
    const bounds = mainWindow.getBounds();
    layoutService.saveWindowBounds({ ...bounds, isMaximized });
  };

  mainWindow.on('resize', saveBounds);
  mainWindow.on('move', saveBounds);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (services) {
    services.ptyManager.destroyAll();
    services.cronService.stopAll();
  }
});
