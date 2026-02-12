import Store from 'electron-store';

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

export interface LayoutConfig {
  sidebarSize: number;
  terminalSize: number;
  editorSize: number;
  lastRepoPath: string | null;
  windowBounds: WindowBounds | null;
  theme: 'constellagent' | 'claude' | 'codex';
}

const defaults: LayoutConfig = {
  sidebarSize: 20,
  terminalSize: 50,
  editorSize: 50,
  lastRepoPath: null,
  windowBounds: null,
  theme: 'constellagent',
};

export class LayoutService {
  private store: Store<LayoutConfig>;

  constructor() {
    this.store = new Store<LayoutConfig>({
      name: 'layout',
      defaults,
    });
  }

  getLayout(): LayoutConfig {
    return {
      sidebarSize: this.store.get('sidebarSize', defaults.sidebarSize),
      terminalSize: this.store.get('terminalSize', defaults.terminalSize),
      editorSize: this.store.get('editorSize', defaults.editorSize),
      lastRepoPath: this.store.get('lastRepoPath', defaults.lastRepoPath),
      windowBounds: this.store.get('windowBounds', defaults.windowBounds),
      theme: this.store.get('theme', defaults.theme),
    };
  }

  saveLayout(layout: Partial<LayoutConfig>): void {
    for (const [key, value] of Object.entries(layout)) {
      this.store.set(key as keyof LayoutConfig, value);
    }
  }

  getWindowBounds(): WindowBounds | null {
    return this.store.get('windowBounds', null);
  }

  saveWindowBounds(bounds: WindowBounds): void {
    this.store.set('windowBounds', bounds);
  }
}
