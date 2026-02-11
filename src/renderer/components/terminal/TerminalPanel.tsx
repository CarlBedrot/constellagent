import { useCallback, useEffect, useRef, useState } from 'react';
import { useTerminalStore } from '@renderer/store/terminal-store';
import { useWorktreeStore } from '@renderer/store/worktree-store';
import { TerminalTab } from './TerminalTab';
import { TerminalInstance } from './TerminalInstance';

export function TerminalPanel(): React.JSX.Element {
  const sessions = useTerminalStore((s) => s.sessions);
  const activeSessionId = useTerminalStore((s) => s.activeSessionId);
  const addSession = useTerminalStore((s) => s.addSession);
  const removeSession = useTerminalStore((s) => s.removeSession);
  const setActiveSession = useTerminalStore((s) => s.setActiveSession);
  const hasCreatedInitial = useRef(false);
  const selectedWorktree = useWorktreeStore((s) => s.selectedWorktree);
  const [mountedSessionIds, setMountedSessionIds] = useState<string[]>([]);

  const createNewSession = useCallback(async () => {
    const result = await window.api.pty.create(selectedWorktree ?? undefined);
    if (result.success) {
      const sessionNum = useTerminalStore.getState().sessions.length + 1;
      addSession({
        id: result.data.sessionId,
        title: `Terminal ${sessionNum}`,
      });
    }
  }, [addSession, selectedWorktree]);

  const closeSession = useCallback(
    (id: string) => {
      window.api.pty.destroy(id);
      removeSession(id);
      setMountedSessionIds((prev) => prev.filter((sessionId) => sessionId !== id));
    },
    [removeSession]
  );

  // Create initial terminal on mount
  useEffect(() => {
    if (!hasCreatedInitial.current) {
      hasCreatedInitial.current = true;
      createNewSession();
    }
  }, [createNewSession]);

  useEffect(() => {
    if (activeSessionId && !mountedSessionIds.includes(activeSessionId)) {
      // Lazy-mount terminals only once they become active to reduce initial load.
      setMountedSessionIds((prev) => [...prev, activeSessionId]);
    }
  }, [activeSessionId, mountedSessionIds]);

  useEffect(() => {
    setMountedSessionIds((prev) => prev.filter((id) => sessions.some((s) => s.id === id)));
  }, [sessions]);

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          height: 36,
          minHeight: 36,
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 12,
          paddingRight: 8,
          gap: 2,
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', gap: 2, flex: 1, overflow: 'auto' }}>
          {sessions.map((session) => (
            <TerminalTab
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
              onSelect={() => setActiveSession(session.id)}
              onClose={() => closeSession(session.id)}
            />
          ))}
        </div>
        <div
          onClick={createNewSession}
          style={{
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 16,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            userSelect: 'none',
            lineHeight: 1,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          +
        </div>
      </div>

      {/* Terminal instances — each mounted, only active one visible */}
      <div style={{ flex: 1, position: 'relative' }}>
        {mountedSessionIds
          .map((id) => sessions.find((s) => s.id === id))
          .filter((session): session is NonNullable<typeof session> => Boolean(session))
          .map((session) => (
          <TerminalInstance
            key={session.id}
            sessionId={session.id}
            isVisible={session.id === activeSessionId}
          />
        ))}
        {sessions.length === 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              No terminal sessions
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
