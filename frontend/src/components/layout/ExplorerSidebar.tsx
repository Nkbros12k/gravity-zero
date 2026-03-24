import React from 'react';
import { ChevronRight, ChevronDown, FileCode, Folder, MoreHorizontal, FilePlus, FolderPlus, RefreshCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ExplorerSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const ExplorerSection: React.FC<ExplorerSectionProps> = ({ title, isOpen, onToggle, children }) => {
  return (
    <div className="border-b border-sidebar-border/50">
      <button
        onClick={onToggle}
        className="w-full flex items-center px-1 py-1 hover:bg-white/5 transition-colors group"
      >
        {isOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">{title}</span>
      </button>
      {isOpen && <div className="pb-1">{children}</div>}
    </div>
  );
};

interface ExplorerSidebarProps {
  onFileClick: (filename: string) => void;
  activeFile: string | null;
}

const ExplorerSidebar: React.FC<ExplorerSidebarProps> = ({ onFileClick, activeFile }) => {
  const [openSections, setOpenSections] = React.useState({
    explorer: true,
    outline: false,
    timeline: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="flex flex-col h-full bg-sidebar-bg text-gray-300 select-none overflow-hidden">
      <div className="h-9 flex items-center justify-between px-4 border-b border-sidebar-border group">
        <span className="text-[11px] font-medium text-gray-400">EXPLORER</span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 hover:bg-white/10 rounded cursor-pointer transition-colors" title="New File">
             <FilePlus size={14} className="text-gray-400" />
          </button>
          <button className="p-1 hover:bg-white/10 rounded cursor-pointer transition-colors" title="New Folder">
             <FolderPlus size={14} className="text-gray-400" />
          </button>
          <button className="p-1 hover:bg-white/10 rounded cursor-pointer transition-colors" title="Refresh Explorer">
             <RefreshCcw size={14} className="text-gray-400" />
          </button>
          <button className="p-1 hover:bg-white/10 rounded cursor-pointer transition-colors" title="Collapse All Folders">
             <MoreHorizontal size={14} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ExplorerSection 
          title="Antigravity-IDE" 
          isOpen={openSections.explorer} 
          onToggle={() => toggleSection('explorer')}
        >
          <div className="flex flex-col gap-[1px]">
             <div className="flex items-center gap-1.5 px-4 py-1 hover:bg-white/5 cursor-pointer group">
                <Folder size={16} className="text-blue-400/80" />
                <span className="text-[13px]">backend</span>
             </div>
             <div className="flex items-center gap-1.5 px-4 py-1 hover:bg-white/5 cursor-pointer group">
                <Folder size={16} className="text-blue-400/80" />
                <span className="text-[13px]">frontend</span>
             </div>
             <div 
               onClick={() => onFileClick('App.tsx')}
               className={cn(
                 "flex items-center gap-1.5 px-4 py-1 cursor-pointer transition-colors",
                 activeFile === 'App.tsx' ? "bg-white/10 text-blue-400" : "hover:bg-white/5"
               )}
             >
                <FileCode size={16} />
                <span className="text-[13px]">App.tsx</span>
             </div>
             <div 
               onClick={() => onFileClick('package.json')}
               className={cn(
                 "flex items-center gap-1.5 px-4 py-1 cursor-pointer transition-colors",
                 activeFile === 'package.json' ? "bg-white/10 text-blue-400" : "hover:bg-white/5"
               )}
             >
                <FileCode size={16} className={activeFile === 'package.json' ? "text-blue-400" : "text-gray-500"} />
                <span className="text-[13px]">package.json</span>
             </div>
             <div 
               onClick={() => onFileClick('README.md')}
               className={cn(
                 "flex items-center gap-1.5 px-4 py-1 cursor-pointer transition-colors",
                 activeFile === 'README.md' ? "bg-white/10 text-blue-400" : "hover:bg-white/5"
               )}
             >
                <FileCode size={16} className={activeFile === 'README.md' ? "text-blue-400" : "text-gray-500"} />
                <span className="text-[13px]">README.md</span>
             </div>
          </div>
        </ExplorerSection>

        <ExplorerSection 
          title="Outline" 
          isOpen={openSections.outline} 
          onToggle={() => toggleSection('outline')}
        >
          <div className="px-5 py-2 text-[11px] text-gray-500 italic">No symbols found</div>
        </ExplorerSection>

        <ExplorerSection 
          title="Timeline" 
          isOpen={openSections.timeline} 
          onToggle={() => toggleSection('timeline')}
        >
          <div className="px-5 py-2 text-[11px] text-gray-500 italic">No events found</div>
        </ExplorerSection>
      </div>
    </div>
  );
};

export default ExplorerSidebar;
