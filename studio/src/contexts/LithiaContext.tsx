import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import { useSocket } from './SocketContext';
import type { LithiaOptions } from '@/types';

interface LithiaContextType {
  config: LithiaOptions | null;
  loading: boolean;
  error: string | null;
}

const LithiaContext = createContext<LithiaContextType>({
  config: null,
  loading: true,
  error: null,
});

interface LithiaProviderProps {
  children: ReactNode;
}

export function LithiaProvider({ children }: LithiaProviderProps) {
  const [config, setConfig] = useState<LithiaOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, connected } = useSocket();

  useEffect(() => {
    if (!socket || !connected) return;

    const handleLithiaConfig = (data: { config: LithiaOptions }) => {
      setConfig(data.config);
      setLoading(false);
      setError(null);
    };

    const handleError = (error: Error) => {
      setError(error.message);
      setLoading(false);
    };

    socket.on('lithia-config', handleLithiaConfig);
    socket.on('error', handleError);

    return () => {
      socket.off('lithia-config', handleLithiaConfig);
      socket.off('error', handleError);
    };
  }, [socket, connected]);

  return (
    <LithiaContext.Provider value={{ config, loading, error }}>
      {children}
    </LithiaContext.Provider>
  );
}

export function useLithia() {
  const context = useContext(LithiaContext);
  if (!context) {
    throw new Error('useLithia must be used within a LithiaProvider');
  }
  return context;
}
