import { useCallback, useEffect, useRef } from 'react';
import Editor, { DiffEditor, type OnMount } from '@monaco-editor/react';
import { type editor as monacoEditor } from 'monaco-editor';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useEditorStore } from '@renderer/store/editor-store';
import { FileTree } from './FileTree';

const MONACO_THEME: monacoEditor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#1e1e1e',
    'editor.foreground': '#e4e4e7',
    'editorLineNumber.foreground': '#52525b',
    'editorLineNumber.activeForeground': '#a1a1aa',
    'editor.selectionBackground': '#6d28d933',
    'editor.lineHighlightBackground': '#ffffff08',
  },
};

function getLanguageFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescriptreact',
    js: 'javascript',
    jsx: 'javascriptreact',
    json: 'json',
    md: 'markdown',
    css: 'css',
    html: 'html',
    py: 'python',
    rs: 'rust',
    go: 'go',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',
  };
  return map[ext] ?? 'plaintext';
}

export function EditorPanel(): React.JSX.Element {
  const openFile = useEditorStore((s) => s.openFile);
  const isDiffMode = useEditorStore((s) => s.isDiffMode);
  const toggleDiffMode = useEditorStore((s) => s.toggleDiffMode);
  const saveFile = useEditorStore((s) => s.saveFile);
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor | null>(null);

  // Ctrl/Cmd+S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (openFile) {
          // Update store content from editor before saving
          if (editorRef.current) {
            const currentContent = editorRef.current.getValue();
            useEditorStore.setState((s) => ({
              openFile: s.openFile ? { ...s.openFile, content: currentContent } : null,
            }));
          }
          saveFile();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openFile, saveFile]);

  const handleEditorMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
    // Apply custom theme
    const monaco = (editor as unknown as { _themeService?: unknown })
    // Use the global monaco instance
    editor.updateOptions({ theme: 'constellagent-dark' });
  }, []);

  const handleBeforeMount = useCallback((monacoInstance: typeof import('monaco-editor')) => {
    monacoInstance.editor.defineTheme('constellagent-dark', MONACO_THEME);
  }, []);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      useEditorStore.setState((s) => ({
        openFile: s.openFile ? { ...s.openFile, content: value } : null,
      }));
    }
  }, []);

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: 'var(--bg-tertiary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          height: 32,
          minHeight: 32,
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 12,
          paddingRight: 12,
          gap: 8,
        }}
      >
        {openFile && (
          <>
            <span style={{ fontSize: 12, color: 'var(--text-primary)', flex: 1 }}>
              {openFile.path}
            </span>
            <button
              onClick={toggleDiffMode}
              style={{
                padding: '2px 8px',
                borderRadius: 3,
                border: '1px solid var(--border-color)',
                backgroundColor: isDiffMode ? 'var(--accent)' : 'transparent',
                color: isDiffMode ? '#fff' : 'var(--text-secondary)',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              Diff
            </button>
            <button
              onClick={() => {
                if (editorRef.current) {
                  const currentContent = editorRef.current.getValue();
                  useEditorStore.setState((s) => ({
                    openFile: s.openFile ? { ...s.openFile, content: currentContent } : null,
                  }));
                }
                saveFile();
              }}
              style={{
                padding: '2px 8px',
                borderRadius: 3,
                border: '1px solid var(--border-color)',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              Save
            </button>
          </>
        )}
        {!openFile && (
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Select a file to view
          </span>
        )}
      </div>

      {/* Content area: file tree + editor */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <PanelGroup direction="horizontal">
          {/* File tree */}
          <Panel defaultSize={25} minSize={15} maxSize={40}>
            <div
              style={{
                height: '100%',
                borderRight: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <FileTree />
            </div>
          </Panel>

          <PanelResizeHandle style={{ width: 1, cursor: 'col-resize' }} />

          {/* Editor / Diff */}
          <Panel defaultSize={75} minSize={40}>
            <div style={{ height: '100%' }}>
              {!openFile && (
                <div
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    No file selected
                  </span>
                </div>
              )}

              {openFile && isDiffMode && (
                <DiffEditor
                  original={openFile.originalContent}
                  modified={openFile.content}
                  language={getLanguageFromPath(openFile.path)}
                  theme="constellagent-dark"
                  beforeMount={handleBeforeMount}
                  options={{
                    readOnly: false,
                    renderSideBySide: true,
                    fontSize: 13,
                    fontFamily: "'SF Mono', 'Fira Code', Menlo, monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                  }}
                />
              )}

              {openFile && !isDiffMode && (
                <Editor
                  value={openFile.content}
                  language={getLanguageFromPath(openFile.path)}
                  theme="constellagent-dark"
                  beforeMount={handleBeforeMount}
                  onMount={handleEditorMount}
                  onChange={handleEditorChange}
                  options={{
                    fontSize: 13,
                    fontFamily: "'SF Mono', 'Fira Code', Menlo, monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    automaticLayout: true,
                  }}
                />
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
