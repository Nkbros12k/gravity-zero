import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User, Bot, StopCircle, Braces } from 'lucide-react';

export default function ThoughtStream({ chatId }) {
  const [logs, setLogs] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const endOfLogsRef = useRef(null);

  // Load chat history when chatId changes
  useEffect(() => {
    if (chatId) {
      const history = JSON.parse(localStorage.getItem('ag_chats') || '{}');
      setLogs(history[chatId]?.logs || []);
    } else {
      setLogs([]);
    }
    setPrompt('');
  }, [chatId]);

  // Websocket listener
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/api/ws/thoughts');
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLogs(prev => [...prev, data]);
      } catch (e) {
        setLogs(prev => [...prev, { type: 'raw', message: event.data }]);
      }
    };

    return () => ws.close();
  }, []);

  // Save logs dynamically to localStorage
  useEffect(() => {
    if (!chatId || logs.length === 0) return;
    
    const preview = logs.find(l => l.type === 'user')?.message || 'Agent Task...';
    
    const history = JSON.parse(localStorage.getItem('ag_chats') || '{}');
    history[chatId] = {
      id: chatId,
      timestamp: history[chatId]?.timestamp || Date.now(),
      preview: preview,
      logs: logs
    };
    localStorage.setItem('ag_chats', JSON.stringify(history));
    
    window.dispatchEvent(new Event('ag_chats_updated'));
  }, [logs, chatId]);

  useEffect(() => {
    endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!prompt.trim() || isProcessing) return;
    
    setIsProcessing(true);
    setLogs(prev => [...prev, { type: 'user', message: prompt }]);
    const currentPrompt = prompt;
    setPrompt('');
    
    try {
      await axios.post('http://localhost:8000/api/chat', {
        message: currentPrompt,
        target_dir: '.',
        chat_id: chatId
      });
    } catch (e) {
      setLogs(prev => [...prev, { type: 'error', message: 'Triad Error: ' + e.message }]);
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

  return (
    <div className="flex flex-col h-full bg-vsc-sidebar">
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 font-sans text-[13px] leading-relaxed relative scroll-smooth flex flex-col text-vsc-text select-text">
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-vsc-textMuted space-y-4 m-auto select-none">
             <div className="p-4 bg-[#1e1e1e] rounded-full border border-vsc-border shadow-sm">
                 <Braces size={32} className="text-vsc-accent" strokeWidth={1.5} />
             </div>
             <p className="font-semibold text-[13px] tracking-wide">Ask Gravity-Zero a question...</p>
          </div>
        )}
        
        {logs.map((log, i) => (
          <div key={i} className="flex flex-col space-y-2 w-full border-b border-[#2b2b2b] pb-5 last:border-0">
             <div className="flex items-center space-x-2.5 text-[13px] font-semibold text-vsc-text select-none">
                <div className="bg-[#1e1e1e] p-[3px] rounded-[4px] border border-vsc-border shadow-sm">
                    {log.type === 'user' ? <User size={14} className="text-vsc-textMuted" /> : <Bot size={14} className="text-vsc-accent" />}
                </div>
                <span>{log.type === 'user' ? 'You' : 'Gravity-Zero'}</span>
             </div>
             
             <div className={`pl-[34px] ${log.type === 'error' ? 'text-[#f48771]' : log.type === 'success' ? 'text-[#89d185]' : 'text-[#cccccc]'}`}>
                <div className="break-words whitespace-pre-wrap font-sans text-[13px] leading-[22px]">
                   {log.message}
                </div>
             </div>
          </div>
        ))}
        <div ref={endOfLogsRef} className="h-1 shrink-0" />
      </div>

      <div className="px-4 pb-4 pt-3 bg-vsc-sidebar sticky bottom-0 z-10 select-none">
        <form onSubmit={handleSubmit} className="flex flex-col relative w-full">
          <div className="flex items-center bg-[#3c3c3c] border border-transparent focus-within:border-[#007acc] rounded-[2px] transition-colors px-[2px] py-[2px] w-full box-border">
            <textarea 
              className="flex-1 bg-transparent border-none outline-none text-[13px] px-2 py-1.5 text-[#cccccc] resize-none h-[34px] font-sans placeholder-vsc-textMuted"
              placeholder="Ask Copilot or type / for commands"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isProcessing}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            {isProcessing ? (
              <button 
                type="button" 
                onClick={handleCancel}
                className="p-1.5 mx-1 flex items-center justify-center transition-colors bg-transparent hover:bg-vsc-hover text-vsc-text rounded-[3px]"
                title="Cancel generation"
              >
                <StopCircle size={15} />
              </button>
            ) : (
              <button 
                type="submit" 
                className={`p-1.5 mx-1 flex items-center justify-center transition-colors rounded-[3px] ${prompt.trim() ? 'bg-vsc-accent text-white hover:bg-[#006bb3]' : 'bg-transparent text-vsc-textMuted'}`}
                disabled={!prompt.trim()}
              >
                <Send size={14} className="ml-[1px] mt-[1px]" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
