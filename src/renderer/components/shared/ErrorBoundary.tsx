import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackLabel?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[ErrorBoundary] ${this.props.fallbackLabel ?? 'Component'}:`, error, info);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-primary)',
            padding: 24,
          }}
        >
          <div
            style={{
              maxWidth: 360,
              padding: 20,
              borderRadius: 8,
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              {this.props.fallbackLabel ?? 'Panel'} Error
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--text-secondary)',
                marginBottom: 16,
                wordBreak: 'break-word',
              }}
            >
              {this.state.error?.message ?? 'Something went wrong'}
            </div>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '6px 16px',
                borderRadius: 4,
                border: 'none',
                backgroundColor: 'var(--accent)',
                color: '#fff',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
