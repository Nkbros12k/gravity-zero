import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Send, Sparkles, Bot, User, Trash2, Settings, MessageSquarePlus, StopCircle, Braces } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LogEntry {
  type: string;
  message: string;
}

interface AIMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  type?: string;
}

const AIPanel: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatId = useRef<string>(`ag_${Date.now()}`);
  const endRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('ag_chats') || '{}');
    const saved = history[chatId.current]?.logs;
    if (saved) setLogs(saved);
  }, []);

  // WebSocket log stream
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/api/ws/thoughts');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as LogEntry;
        setLogs(prev => [...prev, data]);
      } catch {
        setLogs(prev => [...prev, { type: 'raw', message: event.data }]);
      }
    };

    return () => ws.close();
  }, []);

  // Persist logs to localStorage and notify sidebar
  useEffect(() => {
    if (!chatId.current || logs.length === 0) return;
    const preview = logs.find(l => l.type === 'user')?.message || 'Agent Task...';
    const history = JSON.parse(localStorage.getItem('ag_chats') || '{}');
    history[chatId.current] = {
      id: chatId.current,
      timestamp: history[chatId.current]?.timestamp || Date.now(),
      preview,
      logs,
    };
    localStorage.setItem('ag_chats', JSON.stringify(history));
    window.dispatchEvent(new Event('ag_chats_updated'));
  }, [logs]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const currentPrompt = input;
    setInput('');
    setIsProcessing(true);
    setLogs(prev => [...prev, { type: 'user', message: currentPrompt }]);

    try {
      await axios.post('http://localhost:8000/api/chat', {
        message: currentPrompt,
        target_dir: '.',
        chat_id: chatId.current,
      });
    } catch (e: any) {
      setLogs(prev => [...prev, { type: 'error', message: 'Triad Error: ' + (e.message ?? 'Unknown') }]);
    } finally {
      setIsProcessing(false);
      window.dispatchEvent(new Event('ag_fs_updated'));
    }
  };

  const handleCancel = async () => {
    try {
      await axios.post('http://localhost:8000/api/chat/cancel');
    } catch (e) {
      console.error('Failed to cancel workflow', e);
    }
  };

  const handleNewChat = () => {
    chatId.current = `ag_${Date.now()}`;
    setLogs([]);
    setInput('');
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="flex flex-col h-full bg-sidebar-bg border-l border-sidebar-border overflow-hidden">
      {/* Header */}
      <div className="h-9 flex items-center justify-between px-4 border-b border-sidebar-border select-none">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-blue-400" />
          <span className="text-[11px] font-bold text-gray-200">AI AGENT CHAT</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            className="p-1 hover:bg-white/5 rounded transition-colors text-gray-500 hover:text-gray-300"
            title="New Chat"
            onClick={handleNewChat}
          >
            <MessageSquarePlus size={14} />
          </button>
          <button
            className="p-1 hover:bg-white/5 rounded transition-colors text-gray-500 hover:text-gray-300"
            title="Clear"
            onClick={handleNewChat}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Messages / Logs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-4 select-none">
            <div className="p-4 bg-white/5 rounded-full border border-sidebar-border">
              <Braces size={28} className="text-blue-500" strokeWidth={1.5} />
            </div>
            <p className="text-[13px] font-medium text-gray-500">Ask Gravity-Zero a task...</p>
          </div>
        )}

        {logs.map((log, i) => (
          <div key={i} className="flex flex-col gap-2 border-b border-sidebar-border pb-5 last:border-0">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-6 h-6 rounded flex items-center justify-center",
                log.type === 'user' ? "bg-gray-700 text-gray-300" : "bg-blue-600/20 text-blue-400"
              )}>
                {log.type === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <span className="text-[11px] font-bold text-gray-400 uppercase">
                {log.type === 'user' ? 'You' : 'Gravity-Zero'}
              </span>
            </div>
            <div className={cn("text-[13px] leading-relaxed pl-8 break-words whitespace-pre-wrap", getLogColor(log.type))}>
              {log.message}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar-bg/50">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask agent anything... (Ctrl + L)"
            className="w-full bg-panel-bg border border-sidebar-border rounded-lg py-2.5 px-3 pr-10 text-[13px] text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 resize-none min-h-[40px] max-h-[200px]"
            rows={1}
            disabled={isProcessing}
          />
          {isProcessing ? (
            <button
              onClick={handleCancel}
              className="absolute right-2.5 bottom-2.5 p-1 text-red-400 hover:text-red-300 transition-colors"
              title="Cancel generation"
            >
              <StopCircle size={16} />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={cn(
                "absolute right-2.5 bottom-2.5 p-1 transition-colors",
                input.trim() ? "text-blue-500 hover:text-blue-400" : "text-gray-600"
              )}
            >
              <Send size={16} />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <button className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-gray-300 transition-colors">
            <Settings size={14} />
          </button>
          <span className="text-[10px] text-gray-600">
            {isProcessing ? '⟳ Triad running...' : 'Enter to send · Shift+Enter for newline'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
