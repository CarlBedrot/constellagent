import { create } from 'zustand';
import type { CronJob } from '../../preload/api-types';

interface CronState {
  jobs: CronJob[];
  loading: boolean;

  loadJobs: () => Promise<void>;
  addJob: (params: {
    name: string;
    expression: string;
    command: string;
    cwd: string;
    enabled: boolean;
  }) => Promise<boolean>;
  removeJob: (id: string) => Promise<boolean>;
  toggleJob: (id: string) => Promise<void>;
  executeJob: (id: string) => Promise<void>;
}

export const useCronStore = create<CronState>((set, get) => ({
  jobs: [],
  loading: false,

  loadJobs: async () => {
    set({ loading: true });
    const result = await window.api.cron.list();
    if (result.success) {
      set({ jobs: result.data, loading: false });
    } else {
      set({ loading: false });
    }
  },

  addJob: async (params) => {
    const result = await window.api.cron.add(params);
    if (result.success) {
      await get().loadJobs();
      return true;
    }
    return false;
  },

  removeJob: async (id) => {
    const result = await window.api.cron.remove(id);
    if (result.success) {
      await get().loadJobs();
      return true;
    }
    return false;
  },

  toggleJob: async (id) => {
    const result = await window.api.cron.toggle(id);
    if (result.success) {
      await get().loadJobs();
    }
  },

  executeJob: async (id) => {
    await window.api.cron.execute(id);
    await get().loadJobs();
  },
}));
