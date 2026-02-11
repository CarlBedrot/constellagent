import { create } from 'zustand';

export interface TerminalSession {
  id: string;
  title: string;
}

interface TerminalState {
  sessions: TerminalSession[];
  activeSessionId: string | null;
  splitCount: 1 | 2 | 3;
  activePaneIndex: number;
  paneSessions: Array<string | null>;
  addSession: (session: TerminalSession) => void;
  removeSession: (id: string) => void;
  setActiveSession: (id: string) => void;
  setSplitCount: (count: 1 | 2 | 3) => void;
  setActivePaneIndex: (index: number) => void;
  assignSessionToPane: (paneIndex: number, sessionId: string) => void;
  assignSessionToActivePane: (sessionId: string) => void;
  updateTitle: (id: string, title: string) => void;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  splitCount: 1,
  activePaneIndex: 0,
  paneSessions: [null, null, null],

  addSession: (session) =>
    set((state) => {
      const paneIndex = Math.min(state.activePaneIndex, state.splitCount - 1);
      const paneSessions = [...state.paneSessions];

      for (let i = 0; i < paneSessions.length; i += 1) {
        if (paneSessions[i] === session.id) {
          paneSessions[i] = null;
        }
      }
      paneSessions[paneIndex] = session.id;

      return {
        sessions: [...state.sessions, session],
        activeSessionId: session.id,
        paneSessions,
      };
    }),

  removeSession: (id) =>
    set((state) => {
      const remaining = state.sessions.filter((s) => s.id !== id);
      let nextActive = state.activeSessionId;
      if (state.activeSessionId === id) {
        const idx = state.sessions.findIndex((s) => s.id === id);
        nextActive = remaining[Math.min(idx, remaining.length - 1)]?.id ?? null;
      }
      const paneSessions = state.paneSessions.map((paneId) => (paneId === id ? null : paneId));
      return { sessions: remaining, activeSessionId: nextActive, paneSessions };
    }),

  setActiveSession: (id) => {
    const exists = get().sessions.some((s) => s.id === id);
    if (exists) {
      set({ activeSessionId: id });
    }
  },

  setSplitCount: (count) =>
    set((state) => {
      const splitCount = count;
      const activePaneIndex = Math.min(state.activePaneIndex, splitCount - 1);
      const paneSessions = [...state.paneSessions];

      const assigned = new Set(paneSessions.filter(Boolean) as string[]);
      const sessionIds = state.sessions.map((s) => s.id);

      for (let i = 0; i < splitCount; i += 1) {
        if (!paneSessions[i]) {
          const candidate = sessionIds.find((id) => !assigned.has(id));
          if (candidate) {
            paneSessions[i] = candidate;
            assigned.add(candidate);
          }
        }
      }

      if (splitCount > 0 && !paneSessions[0] && state.activeSessionId) {
        paneSessions[0] = state.activeSessionId;
      }

      return { splitCount, activePaneIndex, paneSessions };
    }),

  setActivePaneIndex: (index) =>
    set((state) => ({
      activePaneIndex: Math.max(0, Math.min(index, state.splitCount - 1)),
    })),

  assignSessionToPane: (paneIndex, sessionId) =>
    set((state) => {
      const paneSessions = [...state.paneSessions];

      for (let i = 0; i < paneSessions.length; i += 1) {
        if (paneSessions[i] === sessionId) {
          paneSessions[i] = null;
        }
      }

      paneSessions[paneIndex] = sessionId;

      return {
        paneSessions,
        activeSessionId: sessionId,
        activePaneIndex: paneIndex,
      };
    }),

  assignSessionToActivePane: (sessionId) => {
    const { activePaneIndex } = get();
    get().assignSessionToPane(activePaneIndex, sessionId);
  },

  updateTitle: (id, title) =>
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? { ...s, title } : s)),
    })),
}));
