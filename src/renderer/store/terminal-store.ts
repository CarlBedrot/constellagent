import { create } from 'zustand';

export interface TerminalSession {
  id: string;
  title: string;
}

interface TerminalState {
  sessions: TerminalSession[];
  activeSessionId: string | null;
  addSession: (session: TerminalSession) => void;
  removeSession: (id: string) => void;
  setActiveSession: (id: string) => void;
  updateTitle: (id: string, title: string) => void;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  sessions: [],
  activeSessionId: null,

  addSession: (session) =>
    set((state) => ({
      sessions: [...state.sessions, session],
      activeSessionId: session.id,
    })),

  removeSession: (id) =>
    set((state) => {
      const remaining = state.sessions.filter((s) => s.id !== id);
      let nextActive = state.activeSessionId;
      if (state.activeSessionId === id) {
        const idx = state.sessions.findIndex((s) => s.id === id);
        nextActive = remaining[Math.min(idx, remaining.length - 1)]?.id ?? null;
      }
      return { sessions: remaining, activeSessionId: nextActive };
    }),

  setActiveSession: (id) => {
    const exists = get().sessions.some((s) => s.id === id);
    if (exists) {
      set({ activeSessionId: id });
    }
  },

  updateTitle: (id, title) =>
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? { ...s, title } : s)),
    })),
}));
