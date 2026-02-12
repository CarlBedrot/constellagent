import type { CSSProperties } from 'react';
import type { ThemeName } from '@renderer/types/theme';
import { THEME_OPTIONS } from '@renderer/types/theme';

interface SettingsModalProps {
  theme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
  onClose: () => void;
}

export function SettingsModal({
  theme,
  onThemeChange,
  onClose,
}: SettingsModalProps): React.JSX.Element {
  return (
    <div
      style={
        {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        WebkitAppRegion: 'no-drag',
      } as CSSProperties & { WebkitAppRegion: string }
      }
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 360,
          borderRadius: 10,
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
            Settings
          </span>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: 16,
              cursor: 'pointer',
            }}
            title="Close"
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Theme
          </span>
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onThemeChange(option.value)}
              style={{
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                backgroundColor: option.value === theme ? 'var(--bg-tertiary)' : 'transparent',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                textAlign: 'left',
                cursor: 'pointer',
                color: 'var(--text-primary)',
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 9999,
                  backgroundColor: option.value === theme ? 'var(--accent)' : 'var(--border-color)',
                  flexShrink: 0,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{option.label}</span>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                  {option.description}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
