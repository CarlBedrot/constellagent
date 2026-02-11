import type { CSSProperties } from 'react';

export const sectionTitleStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--text-secondary)',
  flex: 1,
};

export const iconButtonStyle: CSSProperties = {
  fontSize: 16,
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  lineHeight: 1,
  padding: '0 2px',
  borderRadius: 3,
};

export const ghostButtonStyle: CSSProperties = {
  padding: '4px 8px',
  borderRadius: 4,
  border: 'none',
  backgroundColor: 'transparent',
  color: 'var(--text-secondary)',
  fontSize: 11,
  cursor: 'pointer',
  textAlign: 'left',
};
