import { useRoutes } from '@/contexts/RoutesContext';
import type { Route } from '@/types';
import { Loader2, AlertCircle, Route as RouteIcon } from 'lucide-react';

interface RouteListProps {
  onRouteSelect: (route: Route) => void;
  selectedRoute: Route | null;
}

export function RouteList({ onRouteSelect, selectedRoute }: RouteListProps) {
  const { routes, loading, error } = useRoutes();

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <Loader2 className="text-lithia-primary h-8 w-8 animate-spin" />
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
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <div className="text-center text-red-400">
          <div className="font-medium">Connection Error</div>
          <div className="text-dark-500 mt-1 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4">
        <RouteIcon className="text-dark-500 h-8 w-8" />
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
    <div className="space-y-2">
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
          <span className="font-mono text-sm text-white">{route.path}</span>
        </div>
        {route.dynamic && (
          <div className="text-lithia-primary bg-lithia-primary/10 rounded-md px-2 py-1 text-xs">
            Dynamic
          </div>
        )}
      </div>
    </div>
  );
}
