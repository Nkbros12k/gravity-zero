import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Send, Sparkles, Bot, User, Trash2, Settings, MessageSquarePlus, StopCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  type?: string;
}

const AIPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your Antigravity AI assistant. Describe a task and I'll orchestrate the Planner → Coder → Reviewer pipeline.",
      type: 'info'
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatId = useRef<string>(`ag_${Date.now()}`);
  const endRef = useRef<HTMLDivElement>(null);

  // WebSocket log stream
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/api/ws/thoughts');

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const roleMap: Record<string, 'assistant' | 'user'> = {
          info: 'assistant',
          success: 'assistant',
          error: 'assistant',
          raw: 'assistant',
        };
        setMessages(prev => [...prev, {
          id: Date.now().toString() + Math.random(),
          role: roleMap[data.type] ?? 'assistant',
          content: data.message || JSON.stringify(data),
          type: data.type,
        }]);
      } catch {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: event.data,
          type: 'raw',
        }]);
      }
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMsg]);
    const currentPrompt = input;
    setInput('');
    setIsProcessing(true);

    try {
      await axios.post('http://localhost:8000/api/chat', {
        message: currentPrompt,
        target_dir: '.',
        chat_id: chatId.current,
      });
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Triad Error: ' + (e.message ?? 'Unknown error'),
        type: 'error',
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    chatId.current = `ag_${Date.now()}`;
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: "Chat cleared. Ready for a new task!",
      type: 'info',
    }]);
  };

  const getMessageColor = (type?: string) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'user': return 'text-gray-300';
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
           <button className="p-1 hover:bg-white/5 rounded transition-colors text-gray-500 hover:text-gray-300" title="New Chat" onClick={handleClear}>
             <MessageSquarePlus size={14} />
           </button>
           <button className="p-1 hover:bg-white/5 rounded transition-colors text-gray-500 hover:text-gray-300" title="Clear" onClick={handleClear}>
             <Trash2 size={14} />
           </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-6 h-6 rounded flex items-center justify-center",
                msg.role === 'assistant' ? "bg-blue-600/20 text-blue-400" : "bg-gray-700 text-gray-300"
              )}>
                {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
              </div>
              <span className="text-[11px] font-bold text-gray-400 uppercase">
                {msg.role === 'assistant' ? 'Gravity-Zero' : 'You'}
              </span>
            </div>
            <div className={cn("text-[13px] leading-relaxed pl-8", getMessageColor(msg.type))}>
              {msg.content}
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
          <button
            onClick={handleSend}
            disabled={isProcessing}
            className="absolute right-2.5 bottom-2.5 p-1 text-blue-500 hover:text-blue-400 transition-colors disabled:opacity-50"
          >
            {isProcessing ? <StopCircle size={16} className="text-red-400" /> : <Send size={16} />}
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex gap-2">
             <button className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-gray-300 transition-colors">
               <Settings size={14} />
             </button>
          </div>
          <span className="text-[10px] text-gray-600">
            {isProcessing ? '⟳ Triad running...' : 'Enter to send'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
