import React from 'react';
import {
  GitBranch,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  WifiOff,
  Bot,
} from 'lucide-react';

const StatusBar: React.FC = () => {
  const [backendStatus, setBackendStatus] = React.useState<'connected' | 'disconnected'>('disconnected');

  React.useEffect(() => {
    let mounted = true;

    const checkHealth = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/health');
        if (mounted) setBackendStatus(res.ok ? 'connected' : 'disconnected');
      } catch {
        if (mounted) setBackendStatus('disconnected');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const isConnected = backendStatus === 'connected';

  return (
    <footer
      className="h-[22px] bg-blue-600 text-white flex items-center justify-between px-3 text-[11px] select-none"
      role="contentinfo"
      aria-label="Status bar"
    >
      <div className="flex items-center h-full">
        <span className="flex items-center gap-1 px-2 h-full">
          <GitBranch size={13} aria-hidden="true" />
          <span>main</span>
        </span>

        <div className="flex items-center gap-2 h-full px-2">
          <span className="flex items-center gap-0.5 px-1">
            <AlertCircle size={13} aria-hidden="true" />
            <span aria-label="0 errors">0</span>
          </span>
          <span className="flex items-center gap-0.5 px-1">
            <AlertTriangle size={13} aria-hidden="true" />
            <span aria-label="0 warnings">0</span>
          </span>
        </div>

        <div className="h-3.5 w-[1px] bg-white/20 mx-1" aria-hidden="true" />

        <span className="flex items-center gap-1.5 px-2 h-full">
          <CheckCircle2 size={13} aria-hidden="true" />
          <span>Ready</span>
        </span>
      </div>

      <div className="flex items-center h-full">
        <div className="flex items-center gap-3 px-3 h-full border-r border-white/10">
          <span className="flex items-center gap-1 px-1">
            <Bot size={13} aria-hidden="true" />
            <span>Gravity-Zero</span>
          </span>
        </div>

        <div className="flex items-center gap-3 px-3 h-full">
          <span>UTF-8</span>
          <span
            className={`flex items-center gap-1 ${isConnected ? '' : 'opacity-70'}`}
            aria-label={`Backend ${isConnected ? 'connected' : 'disconnected'}`}
          >
            {isConnected
              ? <Wifi size={13} aria-hidden="true" />
              : <WifiOff size={13} aria-hidden="true" />}
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default StatusBar;
