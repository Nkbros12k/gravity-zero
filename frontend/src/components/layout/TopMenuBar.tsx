import React from 'react';
import { LayoutGrid, Settings, UserCircle, Bell, ChevronDown } from 'lucide-react';

const TopMenuBar: React.FC = () => {
  const menus = ['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'];

  return (
    <div className="h-9 bg-sidebar-bg border-b border-sidebar-border flex items-center justify-between px-3 select-none drag-region">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 mr-2">
          <div className="w-5 h-5 bg-blue-600 rounded-sm flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">AG</span>
          </div>
          <span className="text-[11px] font-semibold text-gray-200">Antigravity IDE</span>
        </div>
        
        <div className="flex items-center">
          {menus.map((menu) => (
            <button
              key={menu}
              className="px-2.5 py-1 text-[11.5px] text-gray-400 hover:bg-white/5 hover:text-gray-100 rounded transition-colors"
            >
              {menu}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex justify-center px-4 max-w-xl">
        <div className="w-full h-6 bg-white/5 border border-white/10 rounded-md flex items-center px-3 gap-2 cursor-pointer hover:bg-white/10 transition-colors">
          <span className="text-[10px] text-gray-500">Antigravity IDE — Search or ask anything...</span>
          <div className="ml-auto flex gap-1">
            <kbd className="px-1 py-0 border border-white/20 rounded text-[9px] text-gray-500 bg-white/5">Ctrl</kbd>
            <kbd className="px-1 py-0 border border-white/20 rounded text-[9px] text-gray-500 bg-white/5">P</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium transition-colors shadow-sm">
          <LayoutGrid size={14} />
          Open Agent Manager
        </button>
        
        <div className="h-4 w-[1px] bg-white/10 mx-1" />
        
        <button className="p-1.5 text-gray-400 hover:text-gray-100 transition-colors">
          <Bell size={16} />
        </button>
        <button className="p-1.5 text-gray-400 hover:text-gray-100 transition-colors">
          <Settings size={16} />
        </button>
        <div className="flex items-center gap-1 pl-1 ml-1 cursor-pointer hover:bg-white/5 p-1 rounded">
          <div className="w-5 h-5 bg-gray-700 rounded-full overflow-hidden border border-white/10" />
          <ChevronDown size={14} className="text-gray-500" />
        </div>
      </div>
    </div>
  );
};

export default TopMenuBar;
