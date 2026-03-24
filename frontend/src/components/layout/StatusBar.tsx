import React from 'react';
import { 
  GitBranch, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Wifi,
  Bot
} from 'lucide-react';

const StatusBar: React.FC = () => {
  return (
    <div className="h-[22px] bg-blue-600 text-white flex items-center justify-between px-3 text-[11px] select-none">
      <div className="flex items-center h-full">
        <button className="flex items-center gap-1 px-2 h-full hover:bg-white/10 transition-colors">
          <GitBranch size={13} />
          <span>main*</span>
        </button>
        
        <div className="flex items-center gap-2 h-full px-2">
          <div className="flex items-center gap-0.5 hover:bg-white/10 px-1 rounded transition-colors cursor-pointer">
            <AlertCircle size={13} />
            <span>0</span>
          </div>
          <div className="flex items-center gap-0.5 hover:bg-white/10 px-1 rounded transition-colors cursor-pointer">
            <AlertTriangle size={13} />
            <span>0</span>
          </div>
        </div>
        
        <div className="h-3.5 w-[1px] bg-white/20 mx-1" />
        
        <button className="flex items-center gap-1.5 px-2 h-full hover:bg-white/10 transition-colors">
          <CheckCircle2 size={13} />
          <span>Ready</span>
        </button>
      </div>

      <div className="flex items-center h-full">
        <div className="flex items-center gap-3 px-3 h-full border-r border-white/10">
          <div className="flex items-center gap-1 hover:bg-white/10 px-1 transition-colors cursor-pointer">
            <Bot size={13} />
            <span>Auto Accept: <span className="font-bold">ON</span></span>
          </div>
          <div className="flex items-center gap-1 hover:bg-white/10 px-1 transition-colors cursor-pointer">
            <Bot size={13} className="text-gray-200" />
            <span>Background: <span className="font-bold opacity-70">OFF</span></span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 h-full">
          <span>UTF-8</span>
          <span>TypeScript JSX</span>
          <div className="flex items-center gap-1">
            <Wifi size={13} />
            <span>Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
