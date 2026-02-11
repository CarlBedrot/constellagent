import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { ptyBus } from './pty-bus';

interface TerminalInstanceProps {
  sessionId: string;
  isVisible: boolean;
}

export function TerminalInstance({ sessionId, isVisible }: TerminalInstanceProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const mountedRef = useRef(false);

  // Mount xterm once
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mountedRef.current) return;
    mountedRef.current = true;

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
      lineHeight: 1.3,
      theme: {
        background: '#0a0a0a',
        foreground: '#e4e4e7',
        cursor: '#e4e4e7',
        selectionBackground: '#6d28d933',
        black: '#18181b',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#e4e4e7',
        brightBlack: '#52525b',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#facc15',
        brightBlue: '#60a5fa',
        brightMagenta: '#c084fc',
        brightCyan: '#22d3ee',
        brightWhite: '#fafafa',
      },
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(new WebLinksAddon());
    terminal.open(container);

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Initial fit
    requestAnimationFrame(() => {
      try { fitAddon.fit(); } catch { /* not visible yet */ }
    });

    // Wire input → PTY
    const inputDisposable = terminal.onData((data) => {
      window.api.pty.write(sessionId, data);
    });

    // Wire PTY output → terminal via centralized bus
    const handleData = (data: string) => {
      terminal.write(data);
    };

    const handleExit = (_exitCode: number) => {
      terminal.writeln('\r\n\x1b[90m[Process exited]\x1b[0m');
    };

    ptyBus.onData(sessionId, handleData);
    ptyBus.onExit(sessionId, handleExit);

    // Resize handling
    const resizeDisposable = terminal.onResize(({ cols, rows }) => {
      window.api.pty.resize(sessionId, cols, rows);
    });

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        try { fitAddon.fit(); } catch { /* ignore */ }
      });
    });
    resizeObserver.observe(container);

    return () => {
      inputDisposable.dispose();
      resizeDisposable.dispose();
      resizeObserver.disconnect();
      ptyBus.offData(sessionId);
      ptyBus.offExit(sessionId);
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
      mountedRef.current = false;
    };
  }, [sessionId]);

  // Refit when visibility changes
  useEffect(() => {
    if (isVisible && fitAddonRef.current) {
      requestAnimationFrame(() => {
        try { fitAddonRef.current?.fit(); } catch { /* ignore */ }
      });
    }
    if (isVisible && terminalRef.current) {
      terminalRef.current.focus();
    }
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        visibility: isVisible ? 'visible' : 'hidden',
        padding: '4px 0 0 4px',
      }}
    />
  );
}
