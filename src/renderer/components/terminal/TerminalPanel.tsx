import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTerminalStore } from '@renderer/store/terminal-store';
import { useWorktreeStore } from '@renderer/store/worktree-store';
import { TerminalTab } from './TerminalTab';
import { TerminalInstance } from './TerminalInstance';

export function TerminalPanel(): React.JSX.Element {
  const sessions = useTerminalStore((s) => s.sessions);
  const activeSessionId = useTerminalStore((s) => s.activeSessionId);
  const splitCount = useTerminalStore((s) => s.splitCount);
  const activePaneIndex = useTerminalStore((s) => s.activePaneIndex);
  const paneSessions = useTerminalStore((s) => s.paneSessions);
  const addSession = useTerminalStore((s) => s.addSession);
  const removeSession = useTerminalStore((s) => s.removeSession);
  const assignSessionToActivePane = useTerminalStore((s) => s.assignSessionToActivePane);
  const setSplitCount = useTerminalStore((s) => s.setSplitCount);
  const setActivePaneIndex = useTerminalStore((s) => s.setActivePaneIndex);
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

  const assignedSessionIds = useMemo(
    () =>
      paneSessions
        .slice(0, splitCount)
        .filter((id): id is string => Boolean(id)),
    [paneSessions, splitCount]
  );

  useEffect(() => {
    if (activeSessionId && !mountedSessionIds.includes(activeSessionId)) {
      // Lazy-mount terminals only once they become active to reduce initial load.
      setMountedSessionIds((prev) => [...prev, activeSessionId]);
    }
  }, [activeSessionId, mountedSessionIds]);

  useEffect(() => {
    if (assignedSessionIds.length === 0) return;
    setMountedSessionIds((prev) => {
      const next = new Set(prev);
      for (const id of assignedSessionIds) {
        next.add(id);
      }
      return Array.from(next);
    });
  }, [assignedSessionIds]);

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
              paneIndex={(() => {
                const idx = paneSessions.findIndex((id) => id === session.id);
                return idx >= 0 ? idx : undefined;
              })()}
              onSelect={() => assignSessionToActivePane(session.id)}
              onClose={() => closeSession(session.id)}
            />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 6 }}>
          {[1, 2, 3].map((count) => (
            <button
              key={count}
              onClick={() => setSplitCount(count as 1 | 2 | 3)}
              style={{
                padding: '2px 6px',
                borderRadius: 4,
                border: '1px solid var(--border-color)',
                backgroundColor: splitCount === count ? 'var(--accent)' : 'transparent',
                color: splitCount === count ? '#fff' : 'var(--text-secondary)',
                fontSize: 10,
                cursor: 'pointer',
              }}
              title={`Split ${count} pane${count === 1 ? '' : 's'}`}
            >
              {count}x
            </button>
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

      {/* Terminal instances */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: splitCount === 1 ? '1fr' : '1fr 1fr',
          gridTemplateRows: splitCount === 3 ? '1fr 1fr' : '1fr',
          gridTemplateAreas:
            splitCount === 1
              ? '"pane0"'
              : splitCount === 2
                ? '"pane0 pane1"'
                : '"pane0 pane1" "pane0 pane2"',
          gap: 1,
          backgroundColor: 'var(--border-color)',
        }}
      >
        {mountedSessionIds
          .map((id) => sessions.find((s) => s.id === id))
          .filter((session): session is NonNullable<typeof session> => Boolean(session))
          .map((session) => {
            const paneIndex = paneSessions.findIndex((id) => id === session.id);
            const isAssigned = paneIndex >= 0 && paneIndex < splitCount;
            if (!isAssigned) {
              return (
                <div key={session.id} style={{ display: 'none' }}>
                  <TerminalInstance sessionId={session.id} isVisible={false} />
                </div>
              );
            }

            return (
              <div
                key={session.id}
                onMouseDown={() => setActivePaneIndex(paneIndex)}
                style={{
                  gridArea: `pane${paneIndex}`,
                  position: 'relative',
                  backgroundColor: 'var(--bg-primary)',
                  border: paneIndex === activePaneIndex ? '1px solid var(--accent)' : '1px solid transparent',
                }}
              >
                <TerminalInstance
                  sessionId={session.id}
                  isVisible={true}
                  shouldFocus={paneIndex === activePaneIndex}
                />
              </div>
            );
          })}

        {sessions.length === 0 && (
          <div
            style={{
              gridArea: 'pane0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-primary)',
            }}
          >
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              No terminal sessions
            </span>
          </div>
        )}

        {sessions.length > 0 &&
          Array.from({ length: splitCount }).map((_, paneIndex) => {
            const paneAssigned = paneSessions[paneIndex];
            if (paneAssigned) return null;
            return (
              <div
                key={`empty-${paneIndex}`}
                onMouseDown={() => setActivePaneIndex(paneIndex)}
                style={{
                  gridArea: `pane${paneIndex}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-primary)',
                  border: paneIndex === activePaneIndex ? '1px solid var(--accent)' : '1px solid transparent',
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Select a tab
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
