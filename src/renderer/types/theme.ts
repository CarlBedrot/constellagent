export type ThemeName = 'constellagent' | 'claude' | 'codex';

export const THEME_OPTIONS: Array<{ value: ThemeName; label: string; description: string }> = [
  {
    value: 'constellagent',
    label: 'Constellagent',
    description: 'Current dark theme with purple accent.',
  },
  {
    value: 'claude',
    label: 'Claude-style',
    description: 'Warmer panels and orange accent.',
  },
  {
    value: 'codex',
    label: 'Codex-style',
    description: 'Higher contrast with blue accent.',
  },
];
