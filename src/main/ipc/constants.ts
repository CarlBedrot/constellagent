export const IPC_CHANNELS = {
  // PTY
  PTY_CREATE: 'pty:create',
  PTY_WRITE: 'pty:write',
  PTY_RESIZE: 'pty:resize',
  PTY_DESTROY: 'pty:destroy',
  PTY_DATA: 'pty:data',
  PTY_EXIT: 'pty:exit',

  // Git
  GIT_LIST_WORKTREES: 'git:list-worktrees',
  GIT_ADD_WORKTREE: 'git:add-worktree',
  GIT_REMOVE_WORKTREE: 'git:remove-worktree',
  GIT_GET_STATUS: 'git:get-status',
  GIT_GET_BRANCH: 'git:get-branch',
  GIT_IS_REPO: 'git:is-repo',
  GIT_LIST_BRANCHES: 'git:list-branches',
  GIT_SELECT_DIRECTORY: 'git:select-directory',
  GIT_GET_DIFF_FILES: 'git:get-diff-files',

  // File
  FILE_READ: 'file:read',
  FILE_WRITE: 'file:write',
  FILE_GET_ORIGINAL: 'file:get-original',
  FILE_ADD_ALLOWED_PATH: 'file:add-allowed-path',

  // Layout
  LAYOUT_GET: 'layout:get',
  LAYOUT_SAVE: 'layout:save',

  // Cron
  CRON_LIST: 'cron:list',
  CRON_ADD: 'cron:add',
  CRON_UPDATE: 'cron:update',
  CRON_REMOVE: 'cron:remove',
  CRON_TOGGLE: 'cron:toggle',
  CRON_EXECUTE: 'cron:execute',
  CRON_JOB_EXECUTED: 'cron:job-executed',

  // Agent
  AGENT_LIST: 'agent:list',
  AGENT_LAUNCH: 'agent:launch',
  AGENT_STOP: 'agent:stop',
  AGENT_RESTART: 'agent:restart',
  AGENT_REMOVE: 'agent:remove',
  AGENT_UPDATED: 'agent:updated',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
