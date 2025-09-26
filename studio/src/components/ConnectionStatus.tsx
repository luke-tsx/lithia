import { useSocket } from '@/contexts/SocketContext';
import { Wifi, WifiOff } from 'lucide-react';

export function ConnectionStatus() {
  const { connected, config } = useSocket();

  return (
    <div className="flex items-center gap-3 lithia-card px-4 py-3">
      {connected ? (
        <>
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-lithia-primary" />
            <span className="text-sm font-medium text-lithia-primary">
              Connected
            </span>
          </div>
          <div className="w-px h-4 bg-dark-600"></div>
          <div className="text-xs text-dark-400">
            Lithia:{' '}
            <span className="text-lithia-primary font-mono">
              {config?.lithiaPort || '3000'}
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <WifiOff className="w-5 h-5 text-red-400" />
            <span className="text-sm font-medium text-red-400">
              Disconnected
            </span>
          </div>
          <div className="w-px h-4 bg-dark-600"></div>
          <div className="text-xs text-dark-500">Reconnecting...</div>
        </>
      )}
    </div>
  );
}
