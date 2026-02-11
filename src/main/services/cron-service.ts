import Store from 'electron-store';
import cron, { type ScheduledTask } from 'node-cron';
import { randomUUID } from 'crypto';

export interface CronJob {
  id: string;
  name: string;
  kind: 'command' | 'agent';
  expression: string;
  command: string;
  cwd: string;
  repoPath?: string | null;
  enabled: boolean;
  lastRun: string | null;
  nextRun: string | null;
}

type ExecuteCallback = (job: CronJob) => void;

interface StoreSchema {
  cronJobs: CronJob[];
}

export class CronService {
  private store: Store<StoreSchema>;
  private scheduledTasks = new Map<string, ScheduledTask>();
  private onExecuteCallback: ExecuteCallback | null = null;

  constructor() {
    this.store = new Store<StoreSchema>({
      name: 'cron-jobs',
      defaults: { cronJobs: [] },
    });
  }

  onExecute(callback: ExecuteCallback): void {
    this.onExecuteCallback = callback;
  }

  listJobs(): CronJob[] {
    return this.store.get('cronJobs', []).map((job) => this.normalizeJob(job));
  }

  addJob(params: {
    name: string;
    kind?: CronJob['kind'];
    expression: string;
    command: string;
    cwd: string;
    repoPath?: string | null;
    enabled: boolean;
  }): CronJob {
    const job: CronJob = {
      id: randomUUID(),
      name: params.name,
      kind: params.kind ?? 'command',
      expression: params.expression,
      command: params.command,
      cwd: params.cwd,
      repoPath: params.repoPath ?? null,
      enabled: params.enabled,
      lastRun: null,
      nextRun: null,
    };

    const jobs = this.listJobs();
    jobs.push(job);
    this.store.set('cronJobs', jobs);

    if (job.enabled) {
      this.scheduleJob(job);
    }

    return job;
  }

  updateJob(id: string, updates: Partial<Omit<CronJob, 'id'>>): CronJob | null {
    const jobs = this.listJobs();
    const idx = jobs.findIndex((j) => j.id === id);
    if (idx === -1) return null;

    const updated = this.normalizeJob({ ...jobs[idx], ...updates });
    jobs[idx] = updated;
    this.store.set('cronJobs', jobs);

    // Reschedule
    this.unscheduleJob(id);
    if (updated.enabled) {
      this.scheduleJob(updated);
    }

    return updated;
  }

  removeJob(id: string): boolean {
    const jobs = this.listJobs();
    const filtered = jobs.filter((j) => j.id !== id);
    if (filtered.length === jobs.length) return false;

    this.unscheduleJob(id);
    this.store.set('cronJobs', filtered);
    return true;
  }

  toggleJob(id: string): CronJob | null {
    const jobs = this.listJobs();
    const job = jobs.find((j) => j.id === id);
    if (!job) return null;

    return this.updateJob(id, { enabled: !job.enabled });
  }

  executeJob(id: string): CronJob | null {
    const jobs = this.listJobs();
    const job = jobs.find((j) => j.id === id);
    if (!job) return null;

    const now = new Date().toISOString();
    this.updateJob(id, { lastRun: now });

    if (this.onExecuteCallback) {
      this.onExecuteCallback({ ...job, lastRun: now });
    }

    return job;
  }

  scheduleAllEnabled(): void {
    const jobs = this.listJobs();
    for (const job of jobs) {
      if (job.enabled) {
        this.scheduleJob(job);
      }
    }
  }

  stopAll(): void {
    for (const [id, task] of this.scheduledTasks) {
      task.stop();
    }
    this.scheduledTasks.clear();
  }

  private scheduleJob(job: CronJob): void {
    if (!cron.validate(job.expression)) return;

    const task = cron.schedule(job.expression, () => {
      const now = new Date().toISOString();
      this.updateJobLastRun(job.id, now);

      if (this.onExecuteCallback) {
        const current = this.listJobs().find((j) => j.id === job.id);
        if (current) {
          this.onExecuteCallback(current);
        }
      }
    });

    this.scheduledTasks.set(job.id, task);
  }

  private unscheduleJob(id: string): void {
    const task = this.scheduledTasks.get(id);
    if (task) {
      task.stop();
      this.scheduledTasks.delete(id);
    }
  }

  private updateJobLastRun(id: string, lastRun: string): void {
    const jobs = this.listJobs();
    const idx = jobs.findIndex((j) => j.id === id);
    if (idx !== -1) {
      jobs[idx].lastRun = lastRun;
      this.store.set('cronJobs', jobs);
    }
  }

  private normalizeJob(job: CronJob): CronJob {
    return {
      ...job,
      kind: job.kind ?? 'command',
      repoPath: job.repoPath ?? null,
    };
  }
}
