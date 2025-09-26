import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import type { StudioConfig } from '@/types';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  config: StudioConfig | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
  config: null,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [config, setConfig] = useState<StudioConfig | null>(null);

  useEffect(() => {
    // Connect to WebSocket server (same port as Studio UI)
    const studioPort = 8473; // Default Studio port
    const newSocket = io(`ws://localhost:${studioPort}`, {
      transports: ['websocket'],
      timeout: 5000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to Lithia Studio WebSocket');
      setConnected(true);

      // Request Lithia configuration
      newSocket.emit('get-lithia-config');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Lithia Studio WebSocket');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnected(false);
    });

    newSocket.on('lithia-config', (data: { config: StudioConfig }) => {
      console.log('Received Lithia config:', data.config);
      setConfig(data.config);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected, config }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
