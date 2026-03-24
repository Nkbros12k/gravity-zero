import React from 'react';
import { Files, Search, GitBranch, Play, Boxes, User, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

const ActivityBar: React.FC = () => {
  const [active, setActive] = React.useState('explorer');

  const icons = [
    { id: 'explorer', icon: Files, label: 'Explorer' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'source-control', icon: GitBranch, label: 'Source Control' },
    { id: 'debug', icon: Play, label: 'Run & Debug' },
    { id: 'extensions', icon: Boxes, label: 'Extensions' },
  ];

  return (
    <div className="w-12 bg-sidebar-bg border-r border-sidebar-border flex flex-col items-center py-2 justify-between">
      <div className="flex flex-col items-center gap-1 w-full">
        {icons.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            title={label}
            className={cn(
              "w-full h-12 flex items-center justify-center transition-colors relative group",
              active === id ? "text-gray-100" : "text-gray-500 hover:text-gray-300"
            )}
          >
            {active === id && (
              <div className="absolute left-0 w-0.5 h-full bg-blue-500" />
            )}
            <Icon size={24} strokeWidth={1.5} />
            
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-[11px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              {label}
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-1 w-full pb-2">
        <button className="w-full h-12 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors">
          <User size={24} strokeWidth={1.5} />
        </button>
        <button className="w-full h-12 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors">
          <Settings size={24} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default ActivityBar;
