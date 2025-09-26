import { useRoutes } from '@/contexts/RoutesContext';
import type { Route } from '@/types';
import { Loader2, AlertCircle, Route } from 'lucide-react';

interface RouteListProps {
  onRouteSelect: (route: Route) => void;
  selectedRoute: Route | null;
}

export function RouteList({ onRouteSelect, selectedRoute }: RouteListProps) {
  const { routes, loading, error } = useRoutes();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 text-lithia-primary animate-spin" />
        <div className="text-dark-400 text-center">
          <div className="font-medium">Loading API routes...</div>
          <div className="text-sm">
            Discovering endpoints from your Lithia app
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <div className="text-red-400 text-center">
          <div className="font-medium">Connection Error</div>
          <div className="text-sm text-dark-500 mt-1">{error}</div>
        </div>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Route className="w-8 h-8 text-dark-500" />
        <div className="text-dark-400 text-center">
          <div className="font-medium">No routes found</div>
          <div className="text-sm">
            Create some API routes in your Lithia app
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {routes.map((route) => (
        <RouteCard
          key={`${route.method}-${route.path}`}
          route={route}
          isSelected={
            selectedRoute?.path === route.path &&
            selectedRoute?.method === route.method
          }
          onClick={() => onRouteSelect(route)}
        />
      ))}
    </div>
  );
}

interface RouteCardProps {
  route: Route;
  isSelected: boolean;
  onClick: () => void;
}

function RouteCard({ route, isSelected, onClick }: RouteCardProps) {
  const methodClass = `method-${route.method?.toLowerCase() || 'get'}`;

  return (
    <div
      className={`route-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`method-badge ${methodClass}`}>
            {route.method?.toUpperCase() || 'GET'}
          </span>
          <span className="text-white font-mono text-sm">{route.path}</span>
        </div>
        {route.dynamic && (
          <div className="text-xs text-lithia-primary bg-lithia-primary/10 px-2 py-1 rounded-md">
            Dynamic
          </div>
        )}
      </div>
    </div>
  );
}
