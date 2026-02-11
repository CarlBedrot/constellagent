import { useEffect } from 'react';
import { useTerminalStore } from '@renderer/store/terminal-store';
import { useEditorStore } from '@renderer/store/editor-store';

interface ShortcutActions {
  toggleSidebar: () => void;
  createTerminalSession: () => void;
}

export function useKeyboardShortcuts(actions: ShortcutActions): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      // Ctrl/Cmd+B → toggle sidebar
      if (e.key === 'b') {
        e.preventDefault();
        actions.toggleSidebar();
        return;
      }

      // Ctrl/Cmd+T → new terminal tab
      if (e.key === 't') {
        e.preventDefault();
        actions.createTerminalSession();
        return;
      }

      // Ctrl/Cmd+W → close active terminal tab
      if (e.key === 'w') {
        e.preventDefault();
        const { activeSessionId, sessions } = useTerminalStore.getState();
        if (activeSessionId && sessions.length > 0) {
          window.api.pty.destroy(activeSessionId);
          useTerminalStore.getState().removeSession(activeSessionId);
        }
        return;
      }

      // Ctrl/Cmd+S → save file
      if (e.key === 's') {
        e.preventDefault();
        useEditorStore.getState().saveFile();
        return;
      }

      // Ctrl/Cmd+D → toggle diff mode
      if (e.key === 'd') {
        e.preventDefault();
        useEditorStore.getState().toggleDiffMode();
        return;
      }

      // Ctrl/Cmd+1-9 → switch terminal tab
      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const idx = parseInt(e.key, 10) - 1;
        const { sessions } = useTerminalStore.getState();
        if (idx < sessions.length) {
          useTerminalStore.getState().setActiveSession(sessions[idx].id);
        }
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [actions]);
}
