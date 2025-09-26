import { useState } from 'react';
import { RouteList } from '@/components/RouteList';
import { RequestBuilder } from '@/components/RequestBuilder';
import { SocketProvider } from '@/contexts/SocketContext';
import { RoutesProvider } from '@/contexts/RoutesContext';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import type { Route } from '@/types';

function App() {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  return (
    <SocketProvider>
      <RoutesProvider>
        <div className="min-h-screen bg-lithia-background text-white overflow-hidden">
          {/* Header */}
          <header className="lithia-glass border-b border-lithia-primary/20">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src="/logo-green-white.svg"
                      alt="Lithia Logo"
                      className="w-8 h-8"
                    />
                    <div>
                      <h1 className="text-3xl font-bold text-gradient glow-text">
                        Lithia Studio
                      </h1>
                      <p className="text-sm text-dark-400 mt-1">
                        API Testing & Development Environment
                      </p>
                    </div>
                  </div>
                </div>
                <ConnectionStatus />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex h-[calc(100vh-100px)]">
            {/* Left Panel - Routes */}
            <div className="w-1/2 border-r border-dark-700/50 lithia-glass">
              <div className="p-8 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    API Endpoints
                  </h2>
                  <div className="text-sm text-dark-400">
                    Select a route to test
                  </div>
                </div>
                <RouteList
                  onRouteSelect={setSelectedRoute}
                  selectedRoute={selectedRoute}
                />
              </div>
            </div>

            {/* Right Panel - Request Builder */}
            <div className="w-1/2 lithia-glass">
              <div className="p-8 h-full overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Request Builder
                  </h2>
                  <div className="text-sm text-dark-400">
                    {selectedRoute
                      ? `Testing ${selectedRoute.method || 'GET'} ${selectedRoute.path}`
                      : 'No route selected'}
                  </div>
                </div>
                <RequestBuilder
                  route={selectedRoute}
                  onSend={(response) => {
                    console.log('Response:', response);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </RoutesProvider>
    </SocketProvider>
  );
}

export default App;
