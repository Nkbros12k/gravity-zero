import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronRight, RefreshCw, FileCode2, ChevronDown } from 'lucide-react';

export default function FileTree({ onFileSelect, activeFile }) {
  const [currentPath, setCurrentPath] = useState('.');
  const [items, setItems] = useState([]);

  const fetchTree = async (path) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/fs/tree`, { params: { path } });
      setItems(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTree(currentPath);
    const handleFsUpdate = () => fetchTree(currentPath);
    window.addEventListener('ag_fs_updated', handleFsUpdate);
    return () => window.removeEventListener('ag_fs_updated', handleFsUpdate);
  }, [currentPath]);

  const handleGoUp = () => {
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.length > 0 ? parts.join('/') : '.');
  };

  return (
    <div className="text-[13px] text-vsc-text flex flex-col h-full bg-vsc-sidebar select-none">
      <div className="flex items-center justify-between px-5 font-bold tracking-wide uppercase text-vsc-textMuted mb-2 group">
        <div className="flex items-center gap-1 overflow-hidden">
            <span className="truncate text-[11px] font-sans">{currentPath === '.' ? 'GRAVITY-ZERO' : currentPath}</span>
        </div>
        <button onClick={() => fetchTree(currentPath)} className="text-vsc-textMuted opacity-0 group-hover:opacity-100 hover:text-vsc-text transition-colors p-[2px] rounded hover:bg-vsc-hover">
            <RefreshCw size={14} />
        </button>
      </div>
      
      <div className="space-y-0 text-vsc-text">
        {currentPath !== '.' && (
          <div 
            className="flex items-center gap-[6px] py-[3px] px-5 hover:bg-vsc-hover cursor-pointer transition-colors text-vsc-text"
            onClick={handleGoUp}
          >
            <ChevronDown size={14} className="text-vsc-textMuted opacity-0" />
            <span className="opacity-80">..</span>
          </div>
        )}
        {items.map((item, idx) => (
          <div 
            key={idx} 
            className={`flex items-center gap-[6px] py-[3px] px-5 cursor-pointer transition-colors ${activeFile === item.path ? 'bg-[#37373d] text-white' : 'hover:bg-vsc-hover text-vsc-text'}`}
            onClick={() => {
              if (item.is_dir) {
                setCurrentPath(item.path);
              } else {
                onFileSelect(item.path);
              }
            }}
          >
            {item.is_dir ? 
              <ChevronRight size={14} className="text-vsc-textMuted shrink-0" /> : 
              <FileCode2 size={14} className="text-[#519aba] shrink-0" />
            }
            <span className={`truncate ${activeFile === item.path ? 'text-white' : 'text-vsc-text'}`} title={item.name}>
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
