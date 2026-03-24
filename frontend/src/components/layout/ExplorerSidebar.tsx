import React from 'react';
import axios from 'axios';
import { ChevronRight, ChevronDown, FileCode, Folder, MoreHorizontal, FilePlus, FolderPlus, RefreshCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FsItem {
  name: string;
  path: string;
  is_dir: boolean;
}

interface ExplorerSidebarProps {
  onFileClick: (filename: string) => void;
  activeFile: string | null;
}

const ExplorerSidebar: React.FC<ExplorerSidebarProps> = ({ onFileClick, activeFile }) => {
  const [currentPath, setCurrentPath] = React.useState('.');
  const [items, setItems] = React.useState<FsItem[]>([]);
  const [openSections, setOpenSections] = React.useState({ outline: false, timeline: false });

  const fetchTree = async (path: string) => {
    try {
      const res = await axios.get('http://localhost:8000/api/fs/tree', { params: { path } });
      setItems(res.data);
    } catch (e) {
      console.error('Explorer fetch error:', e);
    }
  };

  React.useEffect(() => {
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

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const sectionTitle = currentPath === '.' ? 'ANTIGRAVITY-IDE' : currentPath.split('/').pop()?.toUpperCase() ?? 'EXPLORER';

  return (
    <div className="flex flex-col h-full bg-sidebar-bg text-gray-300 select-none overflow-hidden">
      {/* Header */}
      <div className="h-9 flex items-center justify-between px-4 border-b border-sidebar-border group">
        <span className="text-[11px] font-medium text-gray-400">EXPLORER</span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 hover:bg-white/10 rounded cursor-pointer transition-colors" title="New File">
            <FilePlus size={14} className="text-gray-400" />
          </button>
          <button className="p-1 hover:bg-white/10 rounded cursor-pointer transition-colors" title="New Folder">
            <FolderPlus size={14} className="text-gray-400" />
          </button>
          <button
            className="p-1 hover:bg-white/10 rounded cursor-pointer transition-colors"
            title="Refresh Explorer"
            onClick={() => fetchTree(currentPath)}
          >
            <RefreshCcw size={14} className="text-gray-400" />
          </button>
          <button className="p-1 hover:bg-white/10 rounded cursor-pointer transition-colors" title="Collapse All Folders">
            <MoreHorizontal size={14} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Main File Explorer Section */}
        <div className="border-b border-sidebar-border/50">
          <div className="w-full flex items-center px-1 py-1 hover:bg-white/5 transition-colors">
            <ChevronDown size={16} className="text-gray-400" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">
              {sectionTitle}
            </span>
          </div>

          <div className="pb-1 flex flex-col gap-[1px]">
            {/* Go up one level */}
            {currentPath !== '.' && (
              <div
                className="flex items-center gap-1.5 px-4 py-1 hover:bg-white/5 cursor-pointer transition-colors"
                onClick={handleGoUp}
              >
                <ChevronDown size={16} className="text-gray-500" />
                <span className="text-[13px] text-gray-500">..</span>
              </div>
            )}

            {/* Live file tree items */}
            {items.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-center gap-1.5 py-1 cursor-pointer transition-colors',
                  currentPath === '.' ? 'px-4' : 'px-6',
                  activeFile === item.path
                    ? 'bg-white/10 text-blue-400'
                    : 'hover:bg-white/5 text-gray-300'
                )}
                onClick={() => {
                  if (item.is_dir) {
                    setCurrentPath(item.path);
                  } else {
                    onFileClick(item.path);
                  }
                }}
              >
                {item.is_dir ? (
                  <Folder size={16} className="text-blue-400/80 shrink-0" />
                ) : (
                  <FileCode
                    size={16}
                    className={cn('shrink-0', activeFile === item.path ? 'text-blue-400' : 'text-gray-500')}
                  />
                )}
                <span className="text-[13px] truncate" title={item.name}>
                  {item.name}
                </span>
                {item.is_dir && <ChevronRight size={12} className="text-gray-600 ml-auto shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Outline Section */}
        <div className="border-b border-sidebar-border/50">
          <button
            onClick={() => toggleSection('outline')}
            className="w-full flex items-center px-1 py-1 hover:bg-white/5 transition-colors"
          >
            {openSections.outline
              ? <ChevronDown size={16} className="text-gray-400" />
              : <ChevronRight size={16} className="text-gray-400" />}
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Outline</span>
          </button>
          {openSections.outline && (
            <div className="px-5 py-2 text-[11px] text-gray-500 italic">No symbols found</div>
          )}
        </div>

        {/* Timeline Section */}
        <div className="border-b border-sidebar-border/50">
          <button
            onClick={() => toggleSection('timeline')}
            className="w-full flex items-center px-1 py-1 hover:bg-white/5 transition-colors"
          >
            {openSections.timeline
              ? <ChevronDown size={16} className="text-gray-400" />
              : <ChevronRight size={16} className="text-gray-400" />}
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Timeline</span>
          </button>
          {openSections.timeline && (
            <div className="px-5 py-2 text-[11px] text-gray-500 italic">No events found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplorerSidebar;
