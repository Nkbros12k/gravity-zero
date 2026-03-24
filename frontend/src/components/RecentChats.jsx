import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';

export default function RecentChats({ activeChatId, onSelectChat, onNewChat }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    loadChats();
    window.addEventListener('ag_chats_updated', loadChats);
    return () => window.removeEventListener('ag_chats_updated', loadChats);
  }, []);

  const loadChats = () => {
    const history = JSON.parse(localStorage.getItem('ag_chats') || '{}');
    const chatList = Object.values(history).sort((a, b) => b.timestamp - a.timestamp);
    setChats(chatList);
  };

  const deleteChat = (e, id) => {
    e.stopPropagation();
    const history = JSON.parse(localStorage.getItem('ag_chats') || '{}');
    delete history[id];
    localStorage.setItem('ag_chats', JSON.stringify(history));
    loadChats();
    if (activeChatId === id) {
      onNewChat();
    }
  };

  return (
    <div className="flex flex-col h-full bg-vsc-sidebar select-none">
      <div className="px-5 mb-3 mt-1">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center space-x-1.5 bg-vsc-accent text-white py-[5px] rounded-[2px] text-[12px] font-medium transition-colors hover:bg-[#006bb3]"
        >
          <Plus size={14} />
          <span>New Chat</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-0">
        {chats.length === 0 ? (
          <div className="text-vsc-textMuted text-[12px] px-5 py-2">No recent chats found.</div>
        ) : (
          chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`group flex items-center justify-between px-5 py-[5px] cursor-pointer transition-colors ${
                activeChatId === chat.id ? 'bg-[#37373d] text-white' : 'hover:bg-vsc-hover text-vsc-text'
              }`}
            >
              <div className="flex items-center space-x-2 overflow-hidden">
                <MessageSquare size={13} className={activeChatId === chat.id ? 'text-white shrink-0' : 'text-vsc-textMuted shrink-0 group-hover:text-vsc-text'} />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[13px] truncate w-[130px]">
                    {chat.preview || 'New Chat...'}
                  </span>
                  <span className="text-[#8b949e] text-[10px] mt-[1px]">
                    {new Date(chat.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button 
                onClick={(e) => deleteChat(e, chat.id)}
                className="opacity-0 group-hover:opacity-100 text-vsc-textMuted hover:text-white p-[3px] rounded-[3px] hover:bg-[#5a5d5e] transition-colors"
                title="Delete Chat"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
