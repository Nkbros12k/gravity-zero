import React, { useState, useRef, useCallback, useEffect } from 'react';
import FileTree from './components/FileTree';
import Editor from './components/Editor';
import ThoughtStream from './components/ThoughtStream';
import RecentChats from './components/RecentChats';
import { Files, MessageSquare, Menu, Settings, X, Plus } from 'lucide-react';

function App() {
  const [activeFile, setActiveFile] = useState(null);
  
  const [activeTab, setActiveTab] = useState('explorer');
  const [activeChatId, setActiveChatId] = useState(() => Date.now().toString());

  const [rightWidth, setRightWidth] = useState(360);
  const isResizingRight = useRef(false);

  const startResizingRight = useCallback(() => {
    isResizingRight.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = useCallback(() => {
    if (isResizingRight.current) {
      isResizingRight.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }
  }, []);

  const resize = useCallback((e) => {
    if (isResizingRight.current) {
      const newWidth = document.body.clientWidth - e.clientX;
      const maxAllowed = document.body.clientWidth * 0.5;
      if (newWidth > 200 && newWidth < maxAllowed) {
        setRightWidth(newWidth);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const handleNewChat = () => {
    setActiveChatId(Date.now().toString());
  };

  return (
    <div className="flex flex-col h-screen bg-vsc-bg text-vsc-text font-sans overflow-hidden">
      {/* Top Banner (Command Center placeholder) */}
      <div className="h-[35px] bg-[#181818] border-b border-[#2b2b2b] flex items-center justify-between px-3 shrink-0 select-none">
        <div className="flex items-center w-64">
          <Menu size={16} className="text-[#cccccc] opacity-80 cursor-pointer hover:opacity-100 ml-1" />
        </div>
        <div className="flex-1 flex max-w-2xl mx-auto items-center justify-center">
            <div className="h-[26px] w-full max-w-[500px] bg-[#2d2d2d] border border-transparent hover:border-[#555] rounded-[6px] flex items-center justify-center text-[12px] text-[#cccccc] font-sans transition-colors cursor-pointer">
                Gravity-Zero Workspace
            </div>
        </div>
        <div className="flex items-center space-x-2 w-64 justify-end h-full">
            <div className="h-full px-4 hover:bg-[#e81123] hover:text-white flex items-center justify-center cursor-pointer text-[#cccccc] opacity-80 hover:opacity-100 transition-colors group">
               <X size={16} />
            </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Activity Bar */}
        <div className="w-[48px] bg-vsc-sidebar flex flex-col items-center py-0 shrink-0 border-r border-[#2b2b2b] justify-between z-10">
           <div className="flex flex-col space-y-0 w-full pt-2">
               <div 
                 className={`w-full flex justify-center py-3 cursor-pointer border-l-[2px] box-border ${activeTab === 'explorer' ? 'border-[#cccccc] text-[#cccccc]' : 'border-transparent text-[#858585] hover:text-[#cccccc]'}`}
                 onClick={() => setActiveTab('explorer')}
                 title="Explorer"
               >
                 <Files size={24} strokeWidth={1.2} />
               </div>
               <div 
                 className={`w-full flex justify-center py-3 cursor-pointer border-l-[2px] box-border ${activeTab === 'chats' ? 'border-[#cccccc] text-[#cccccc]' : 'border-transparent text-[#858585] hover:text-[#cccccc]'}`}
                 onClick={() => setActiveTab('chats')}
                 title="Copilot Chat"
               >
                 <MessageSquare size={24} strokeWidth={1.2} />
               </div>
           </div>
           <div className="w-full flex justify-center py-3 text-[#858585] cursor-pointer hover:text-[#cccccc] pb-4 border-l-[2px] border-transparent box-border">
               <Settings size={24} strokeWidth={1.2} />
           </div>
        </div>

        {/* Left Sidebar Panel */}
        <div className="w-[260px] bg-vsc-sidebar border-r border-[#2b2b2b] flex flex-col shrink-0">
          <div className="px-5 py-[14px] text-[11px] font-normal tracking-wide text-[#cccccc] uppercase flex items-center h-[35px]">
            {activeTab === 'explorer' ? 'Explorer' : 'Copilot Chats'}
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'explorer' ? (
              <FileTree onFileSelect={setActiveFile} activeFile={activeFile} />
            ) : (
              <RecentChats 
                activeChatId={activeChatId} 
                onSelectChat={(id) => {
                  setActiveChatId(id);
                  setActiveTab('explorer');
                }} 
                onNewChat={handleNewChat} 
              />
            )}
          </div>
        </div>

        {/* Center - Editor */}
        <div className="flex-1 flex flex-col min-w-0 bg-vsc-bg relative">
          <Editor activeFile={activeFile} />
        </div>

        {/* Resizer */}
        <div 
          className="w-1 bg-[#2b2b2b] cursor-col-resize hover:bg-vsc-accent transition-colors z-10 shrink-0"
          onMouseDown={startResizingRight}
        />

        {/* Right Sidebar - Agent Thoughts */}
        <div 
          className="bg-vsc-sidebar flex flex-col shrink-0"
          style={{ width: rightWidth }}
        >
          <div className="flex items-center justify-between px-5 py-2 border-b border-[#2b2b2b] bg-vsc-sidebar shrink-0">
            <span className="text-[11px] uppercase tracking-wide font-normal text-vsc-textMuted">Copilot</span>
            <button 
              onClick={handleNewChat}
              className="text-vsc-textMuted hover:text-vsc-text p-1 rounded-[4px] hover:bg-vsc-hover transition-colors"
              title="Start New Generation"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto w-full relative">
            <ThoughtStream chatId={activeChatId} />
          </div>
        </div>
      </div>
      
      {/* Bottom Status Bar */}
      <div className="h-[22px] bg-vsc-accent flex items-center px-3 text-white text-[12px] shrink-0 font-sans">
           <span className="flex items-center gap-1.5 cursor-pointer hover:bg-white/20 px-2 h-full transition-colors">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M10.07 15.04l1.37-1.16-.71-.62-1.07.9-.76-.89.65-.55-4.52-5.32 3.12-2.65L12 9.06l.71-.62-4.51-5.31-4.75 4 4.54 5.34-3.13 2.66-3.84-4.52.71-.62 3.13 3.68 2.4-2.04-4.53-5.34 5.86-4.99L14 7.51l-3.93 7.53z"/></svg>
              <span>Antigravity</span>
           </span>
           <div className="flex-1"></div>
           <span className="cursor-pointer hover:bg-white/20 px-2 h-full flex items-center transition-colors">Port 8000</span>
           <span className="cursor-pointer hover:bg-white/20 px-2 h-full flex items-center transition-colors">UTF-8</span>
      </div>
    </div>
  );
}

export default App;
