import { useCallback, useEffect, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import type { ImperativePanelHandle } from 'react-resizable-panels';
import { TerminalPanel } from './components/terminal/TerminalPanel';
import { Sidebar } from './components/layout/Sidebar';
import { EditorPanel } from './components/editor/EditorPanel';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useWorktreeStore } from './store/worktree-store';
import { useTerminalStore } from './store/terminal-store';
import '@xterm/xterm/css/xterm.css';

export function App(): React.JSX.Element {
  const repoPath = useWorktreeStore((s) => s.repoPath);
  const selectedWorktree = useWorktreeStore((s) => s.selectedWorktree);
  const sidebarRef = useRef<ImperativePanelHandle>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [layoutLoaded, setLayoutLoaded] = useState(false);

  // Saved layout sizes
  const [savedSidebar, setSavedSidebar] = useState(20);
  const [savedTerminal, setSavedTerminal] = useState(50);
  const [savedEditor, setSavedEditor] = useState(50);

  // Load persisted layout on mount
  useEffect(() => {
    window.api.layout.get().then((result) => {
      if (result.success) {
        const { sidebarSize, terminalSize, editorSize, lastRepoPath } = result.data;
        setSavedSidebar(sidebarSize);
        setSavedTerminal(terminalSize);
        setSavedEditor(editorSize);

        if (lastRepoPath && !useWorktreeStore.getState().repoPath) {
          useWorktreeStore.getState().setRepoPath(lastRepoPath);
        }
      }
      setLayoutLoaded(true);
    });
  }, []);

  // Persist repo path when it changes
  useEffect(() => {
    if (layoutLoaded && repoPath) {
      window.api.layout.save({ lastRepoPath: repoPath });
    }
  }, [repoPath, layoutLoaded]);

  // Debounced layout save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveLayout = useCallback((updates: Record<string, number>) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      window.api.layout.save(updates);
    }, 500);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (sidebarCollapsed) {
      sidebarRef.current?.expand();
      setSidebarCollapsed(false);
    } else {
      sidebarRef.current?.collapse();
      setSidebarCollapsed(true);
    }
  }, [sidebarCollapsed]);

  const createTerminalSession = useCallback(async () => {
    const result = await window.api.pty.create(selectedWorktree ?? undefined);
    if (result.success) {
      const sessionNum = useTerminalStore.getState().sessions.length + 1;
      useTerminalStore.getState().addSession({
        id: result.data.sessionId,
        title: `Terminal ${sessionNum}`,
      });
    }
  }, [selectedWorktree]);

  useKeyboardShortcuts({ toggleSidebar, createTerminalSession });

  // Derive title bar text
  const repoName = repoPath ? repoPath.split('/').pop() : null;

  const titleBarStyle = {
    height: 38,
    minHeight: 38,
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 80,
    paddingRight: 16,
    WebkitAppRegion: 'drag',
    userSelect: 'none',
    gap: 8,
  } as React.CSSProperties & { WebkitAppRegion: string };

  if (!layoutLoaded) {
    return (
      <div
        style={{
          height: '100vh',
          backgroundColor: 'var(--bg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Title bar */}
      <div style={titleBarStyle}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            letterSpacing: '0.02em',
          }}
        >
          Constellagent
        </span>
        {repoName && (
          <>
            <span style={{ fontSize: 13, color: 'var(--border-color)' }}>/</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-primary)',
                letterSpacing: '0.01em',
              }}
            >
              {repoName}
            </span>
          </>
        )}
      </div>

      {/* Main layout */}
      <PanelGroup
        direction="horizontal"
        style={{ flex: 1 }}
        onLayout={(sizes) => {
          if (sizes[0] !== undefined && sizes[1] !== undefined) {
            saveLayout({ sidebarSize: sizes[0] });
          }
        }}
      >
        {/* Sidebar */}
        <Panel
          ref={sidebarRef}
          defaultSize={savedSidebar}
          minSize={15}
          maxSize={30}
          collapsible
          collapsedSize={0}
          onCollapse={() => setSidebarCollapsed(true)}
          onExpand={() => setSidebarCollapsed(false)}
        >
          <ErrorBoundary fallbackLabel="Sidebar">
            <Sidebar />
          </ErrorBoundary>
        </Panel>

        <PanelResizeHandle style={{ width: 1, cursor: 'col-resize' }} />

        {/* Right side: terminal + editor */}
        <Panel defaultSize={100 - savedSidebar} minSize={50}>
          <PanelGroup
            direction="vertical"
            onLayout={(sizes) => {
              if (sizes[0] !== undefined && sizes[1] !== undefined) {
                saveLayout({ terminalSize: sizes[0], editorSize: sizes[1] });
              }
            }}
          >
            {/* Terminal panel */}
            <Panel defaultSize={savedTerminal} minSize={20}>
              <ErrorBoundary fallbackLabel="Terminal">
                <TerminalPanel />
              </ErrorBoundary>
            </Panel>

            <PanelResizeHandle style={{ height: 1, cursor: 'row-resize' }} />

            {/* Editor panel */}
            <Panel defaultSize={savedEditor} minSize={20}>
              <ErrorBoundary fallbackLabel="Editor">
                <EditorPanel />
              </ErrorBoundary>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}
