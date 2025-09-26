import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useSocket } from './SocketContext';
import type { Route } from '@/types';

interface RoutesContextType {
  routes: Route[];
  loading: boolean;
  error: string | null;
}

const RoutesContext = createContext<RoutesContextType>({
  routes: [],
  loading: true,
  error: null,
});

export function RoutesProvider({ children }: { children: ReactNode }) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, connected, config } = useSocket();

  // WebSocket updates
  useEffect(() => {
    if (!socket || !connected) return;

    const handleManifestUpdate = (data: { routes: Route[] }) => {
      setRoutes(data.routes);
      setLoading(false);
      setError(null);
    };

    const handleManifestError = (data: { error: string }) => {
      setError(data.error);
      setLoading(false);
    };

    const handleBuildStatus = (data: { success: boolean; error?: string }) => {
      if (!data.success && data.error) {
        setError(data.error);
      }
    };

    socket.on('update-manifest', handleManifestUpdate);
    socket.on('manifest-error', handleManifestError);
    socket.on('build-status', handleBuildStatus);

    // Request initial manifest
    socket.emit('get-manifest');

    return () => {
      socket.off('update-manifest', handleManifestUpdate);
      socket.off('manifest-error', handleManifestError);
      socket.off('build-status', handleBuildStatus);
    };
  }, [socket, connected]);

  // Fallback: fetch routes via HTTP if WebSocket fails
  useEffect(() => {
    if (!connected && config) {
      fetchRoutesViaHTTP();
    }
  }, [connected, config]);

  const fetchRoutesViaHTTP = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:${config?.lithiaPort || 3000}/api/lithia/routes`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch routes');
      }

      const data = await response.json();
      setRoutes(data.routes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch routes');
      console.error('Error fetching routes:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoutesContext.Provider value={{ routes, loading, error }}>
      {children}
    </RoutesContext.Provider>
  );
}

export function useRoutes() {
  const context = useContext(RoutesContext);
  if (!context) {
    throw new Error('useRoutes must be used within a RoutesProvider');
  }
  return context;
}
