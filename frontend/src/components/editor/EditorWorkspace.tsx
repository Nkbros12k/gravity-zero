import React from 'react';
import Editor from '@monaco-editor/react';
import { Bot, Terminal, Files } from 'lucide-react';

const WelcomeScreen: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full bg-editor-bg select-none">
    <div className="w-20 h-20 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20">
      <Bot size={48} className="text-blue-500" />
    </div>
    <h1 className="text-3xl font-light text-gray-200 mb-2">Antigravity IDE</h1>
    <p className="text-gray-500 text-sm mb-12">The AI-first coding environment.</p>
    
    <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-[13px]">
      <div className="flex flex-col gap-3">
        <h3 className="text-gray-400 font-semibold mb-1">Start</h3>
        <button 
          onClick={() => {
            const name = prompt('Enter file name:');
            if (name) window.dispatchEvent(new CustomEvent('open-file', { detail: name }));
          }}
          className="flex items-center gap-2 text-blue-400 hover:underline cursor-pointer bg-transparent border-none p-0"
        >
          <Files size={16} />
          <span>New File</span>
        </button>
        <button 
          onClick={() => alert('Folder selection dialog would open here.')}
          className="flex items-center gap-2 text-blue-400 hover:underline cursor-pointer bg-transparent border-none p-0"
        >
          <Terminal size={16} />
          <span>Open Folder</span>
        </button>
      </div>
      
      <div className="flex flex-col gap-3">
        <h3 className="text-gray-400 font-semibold mb-1">Shortcuts</h3>
        <div className="flex items-center justify-between gap-8 group cursor-default">
          <span className="text-gray-500">Switch to Agent Manager</span>
          <code className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-400 text-[11px]">Ctrl + E</code>
        </div>
        <div className="flex items-center justify-between gap-8 group cursor-default">
          <span className="text-gray-500">Code with Agent</span>
          <code className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-400 text-[11px]">Ctrl + L</code>
        </div>
      </div>
    </div>
  </div>
);

interface EditorWorkspaceProps {
  activeFile: string | null;
  onFileClose: () => void;
}

const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({ activeFile, onFileClose }) => {
  const [fileContent, setFileContent] = React.useState<string>('');

  const handleEditorDidMount = (_editor: any, monaco: any) => {
    monaco.editor.defineTheme('antigravity-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0d0d0d',
        'editor.lineHighlightBackground': '#1a1a1a',
        'editor.selectionBackground': '#264f78',
        'editorCursor.foreground': '#3b82f6',
        'editorLineNumber.foreground': '#4d4d4d',
        'editorLineNumber.activeForeground': '#808080',
      }
    });
    monaco.editor.setTheme('antigravity-dark');
  };

  React.useEffect(() => {
    if (activeFile === 'App.tsx') {
      setFileContent('import React from "react";\n\nexport default function App() {\n  return <div>Hello Antigravity</div>;\n}');
    } else if (activeFile === 'package.json') {
      setFileContent('{\n  "name": "antigravity-ide",\n  "version": "1.0.0"\n}');
    } else if (activeFile) {
      setFileContent(`// Content for ${activeFile}\n\nconsole.log("Loading ${activeFile}...");`);
    }
  }, [activeFile]);

  if (!activeFile) {
    return <WelcomeScreen />;
  }

  return (
    <div className="h-full w-full bg-editor-bg overflow-hidden flex flex-col">
      {/* Tabs */}
      <div className="h-9 bg-sidebar-bg flex items-center border-b border-sidebar-border overflow-x-auto">
         <div className="px-3 py-2 bg-editor-bg border-r border-sidebar-border border-t border-t-blue-500 flex items-center gap-2 h-full cursor-pointer">
            <span className="text-[12px] text-gray-300">{activeFile}</span>
            <span 
              onClick={(e) => {
                e.stopPropagation();
                onFileClose();
              }}
              className="text-gray-600 hover:bg-white/10 hover:text-gray-300 rounded-sm px-0.5 transition-colors"
            >
              ×
            </span>
         </div>
      </div>
      
      <div className="flex-1">
        <Editor
          height="100%"
          path={activeFile}
          defaultLanguage={activeFile.endsWith('.json') ? 'json' : activeFile.endsWith('.md') ? 'markdown' : 'typescript'}
          value={fileContent}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            fontFamily: 'JetBrains Mono',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 }
          }}
        />
      </div>
    </div>
  );
};

export default EditorWorkspace;
