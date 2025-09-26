import { useSocket } from '@/contexts/SocketContext';
import { Wifi, WifiOff } from 'lucide-react';

const ConnectionStatus: React.FC = () => {
  const { connected, config } = useSocket();

  return (
    <div className="bg-lithia-primary/10 border-lithia-primary/20 flex items-center rounded-md border px-4">
      <div className="border-lithia-primary/20 h-full border-r py-2 pr-4">
        {connected ? (
          <Wifi className="text-lithia-primary h-5 w-5" />
        ) : (
          <WifiOff className="h-5 w-5 text-red-400" />
        )}
      </div>
      <div>
        <span className="text-lithia-primary pl-4 text-sm font-medium">
          {config?.server.host}:{config?.server.port}
        </span>
      </div>
    </div>
  );
};

export default ConnectionStatus;
