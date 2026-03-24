import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import axios from 'axios';
import { X, Play } from 'lucide-react';

export default function Editor({ activeFile }) {
  const [content, setContent] = useState('// Select a file from the Explorer to start rendering...\n');
  const [language, setLanguage] = useState('javascript');

  useEffect(() => {
    if (activeFile) {
      axios.get(`http://localhost:8000/api/fs/read`, { params: { path: activeFile } })
        .then(res => {
          setContent(res.data.content);
          if (activeFile.endsWith('.py')) setLanguage('python');
          else if (activeFile.endsWith('.css')) setLanguage('css');
          else if (activeFile.endsWith('.html')) setLanguage('html');
          else if (activeFile.endsWith('.json')) setLanguage('json');
          else if (activeFile.endsWith('.md')) setLanguage('markdown');
          else if (activeFile.endsWith('.ts') || activeFile.endsWith('.tsx')) setLanguage('typescript');
          else setLanguage('javascript');
        })
        .catch(err => {
          console.error(err);
          setContent('// Error reading file');
        });
    }
  }, [activeFile]);

  return (
    <div className="flex flex-col h-full bg-vsc-bg relative">
      <div className="flex items-end bg-[#252526] h-[35px] w-full select-none overflow-x-auto overflow-y-hidden z-20">
        {activeFile ? (
            <div className="h-full flex items-center px-3 bg-[#1e1e1e] border-t-[1px] border-[#007acc] min-w-[120px] max-w-[200px] border-r border-[#2b2b2b] box-border group cursor-pointer text-[#cccccc]">
                <span className="text-[13px] truncate mx-1.5 font-sans">{activeFile.split('/').pop()}</span>
                <X size={14} className="ml-auto text-[#969696] opacity-0 group-hover:opacity-100 hover:bg-[#2a2d2e] rounded p-[1px] transition-colors" />
            </div>
        ) : (
            <div className="h-full flex items-center px-4 text-vsc-textMuted text-[12px] italic">
                No active editor opened
            </div>
        )}
      </div>
      <div className="flex-1 w-full relative pt-1 z-10">
        <MonacoEditor
          height="100%"
          language={language}
          theme="vs-dark"
          value={content}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "Consolas, 'Courier New', monospace",
            padding: { top: 8, bottom: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "solid",
            cursorSmoothCaretAnimation: "off",
            formatOnPaste: true,
            scrollbar: {
              verticalScrollbarSize: 14,
              horizontalScrollbarSize: 14,
              useShadows: false
            },
            lineHeight: 22,
            renderLineHighlight: "all"
          }}
        />
      </div>
    </div>
  );
}
