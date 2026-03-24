import React from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import TopMenuBar from './components/layout/TopMenuBar';
import ActivityBar from './components/layout/ActivityBar';
import ExplorerSidebar from './components/layout/ExplorerSidebar';
import StatusBar from './components/layout/StatusBar';
import EditorWorkspace from './components/editor/EditorWorkspace';
import TerminalPanel from './components/terminal/TerminalPanel';
import AIPanel from './components/ai/AIPanel';

const App: React.FC = () => {
  const [activeFile, setActiveFile] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleOpenFile = (e: any) => setActiveFile(e.detail);
    window.addEventListener('open-file', handleOpenFile);
    return () => window.removeEventListener('open-file', handleOpenFile);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-editor-bg text-gray-300 overflow-hidden font-sans">
      {/* Top Menu Bar */}
      <TopMenuBar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Far-Left Activity Bar */}
        <ActivityBar />

        {/* Resizable Panels Container */}
        <Group orientation="horizontal" className="h-full w-full">
          {/* Left Sidebar: Explorer */}
          <Panel defaultSize="20%" minSize="10%" maxSize="40%" id="explorer-panel">
            <ExplorerSidebar activeFile={activeFile} onFileClick={setActiveFile} />
          </Panel>

          <Separator className="w-[1px] bg-sidebar-border hover:bg-blue-500 hover:w-[2px] transition-all cursor-col-resize" />

          {/* Center Workspace (Editor + Terminal) */}
          <Panel defaultSize="55%" minSize="30%">
            <Group orientation="vertical" className="h-full">
              <Panel defaultSize="70%" minSize="20%">
                <EditorWorkspace activeFile={activeFile} onFileClose={() => setActiveFile(null)} />
              </Panel>
              
              <Separator className="h-[1px] bg-sidebar-border hover:bg-blue-500 hover:h-[2px] transition-all cursor-row-resize" />
              
              <Panel defaultSize="30%" minSize="10%">
                <TerminalPanel />
              </Panel>
            </Group>
          </Panel>

          <Separator className="w-[1px] bg-sidebar-border hover:bg-blue-500 hover:w-[2px] transition-all cursor-col-resize" />

          {/* Right Sidebar: AI Agent Panel */}
          <Panel defaultSize="25%" minSize="15%" maxSize="45%">
            <AIPanel />
          </Panel>
        </Group>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />
    </div>
  );
};

export default App;
