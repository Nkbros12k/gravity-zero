import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { X, ChevronDown, Plus, Trash2 } from 'lucide-react';

const TerminalPanel: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      theme: {
        background: '#121212',
        foreground: '#cccccc',
        cursor: '#3b82f6',
        selectionBackground: 'rgba(59, 130, 246, 0.3)',
      },
      fontSize: 13,
      fontFamily: 'JetBrains Mono',
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    setTimeout(() => fitAddon.fit(), 0);

    const resizeObserver = new ResizeObserver(() => {
      try { fitAddon.fit(); } catch (e) {}
    });
    resizeObserver.observe(terminalRef.current);

    term.writeln('\x1b[1;34mAntigravity IDE Terminal\x1b[0m');
    term.writeln('Type commands to interact with your agent...\r\n');
    term.write('$ ');

    term.onData(data => {
      const char = data.charCodeAt(0);
      if (char === 13) {
        term.write('\r\n$ ');
      } else if (char === 127) {
        term.write('\b \b');
      } else {
        term.write(data);
      }
    });

    xtermRef.current = term;

    return () => {
      resizeObserver.disconnect();
      term.dispose();
    };
  }, []);

  return (
    <div className="h-full w-full bg-[#121212] flex flex-col overflow-hidden">
      <div className="h-9 flex items-center justify-between px-4 border-t border-sidebar-border bg-sidebar-bg">
        <div className="flex items-center gap-4 h-full">
          <div className="flex items-center gap-1.5 h-full border-b border-gray-100 cursor-pointer">
            <span className="text-[11px] font-bold text-gray-100">TERMINAL</span>
          </div>
          <div className="flex items-center gap-1.5 h-full cursor-pointer hover:text-gray-100 text-gray-400">
            <span className="text-[11px] font-bold">OUTPUT</span>
          </div>
          <div className="flex items-center gap-1.5 h-full cursor-pointer hover:text-gray-100 text-gray-400">
             <span className="text-[11px] font-bold tracking-tight">DEBUG CONSOLE</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 hover:bg-white/5 px-1.5 py-0.5 rounded cursor-pointer">
             <Plus size={14} className="text-gray-400" />
             <span className="text-[11px] text-gray-300">powershell</span>
             <ChevronDown size={12} className="text-gray-500" />
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <Trash2 size={14} className="text-gray-400 hover:text-red-400 cursor-pointer" />
          <X size={15} className="text-gray-400 hover:text-gray-100 cursor-pointer" />
        </div>
      </div>
      
      <div className="flex-1 p-2" ref={terminalRef} />
    </div>
  );
};

export default TerminalPanel;
