import { create } from 'zustand';
import type { AgentSession } from '../../preload/api-types';

interface LaunchResult {
  ok: boolean;
  agent?: AgentSession;
  error?: string;
}

interface AgentState {
  agents: AgentSession[];
  loading: boolean;

  initListeners: () => void;
  loadAgents: () => Promise<void>;
  launchAgent: (repoPath: string, command?: string) => Promise<LaunchResult>;
  stopAgent: (id: string) => Promise<void>;
  restartAgent: (id: string) => Promise<void>;
}

let listenersInitialized = false;

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: [],
  loading: false,

  initListeners: () => {
    if (listenersInitialized) return;
    listenersInitialized = true;

    window.api.agent.onUpdated((agent) => {
      set((state) => {
        const existing = state.agents.find((a) => a.id === agent.id);
        if (existing) {
          return {
            agents: state.agents.map((a) => (a.id === agent.id ? agent : a)),
          };
        }
        return { agents: [agent, ...state.agents] };
      });
    });
  },

  loadAgents: async () => {
    set({ loading: true });
    const result = await window.api.agent.list();
    if (result.success) {
      set({ agents: result.data, loading: false });
    } else {
      set({ loading: false });
    }
  },

  launchAgent: async (repoPath, command) => {
    const result = await window.api.agent.launch({ repoPath, command });
    if (result.success) {
      set((state) => ({
        agents: [result.data, ...state.agents.filter((a) => a.id !== result.data.id)],
      }));
      return { ok: true, agent: result.data };
    }
    return { ok: false, error: result.error };
  },

  stopAgent: async (id) => {
    await window.api.agent.stop(id);
  },

  restartAgent: async (id) => {
    const result = await window.api.agent.restart(id);
    if (result.success) {
      set((state) => ({
        agents: state.agents.map((a) => (a.id === id ? result.data : a)),
      }));
    }
  },
}));
