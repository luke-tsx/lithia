import { RoutesProvider } from '@/contexts/RoutesContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { LithiaProvider } from '@/contexts/LithiaContext';
import type { Route } from '@/types';
import { useState } from 'react';

function App() {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  return (
    <SocketProvider>
      <LithiaProvider>
        <RoutesProvider>
          <div className="min-h-screen bg-lithia-background text-white">
            <div className="p-8">
              <h1 className="text-2xl font-bold text-lithia-primary mb-4">
                Lithia Studio
              </h1>
              <p className="text-dark-400">
                Contextos carregados. Pronto para você criar a interface!
              </p>
              {selectedRoute && (
                <div className="mt-4 p-4 bg-dark-800 rounded">
                  <p className="text-sm">
                    Rota selecionada: {selectedRoute.path}
                  </p>
                </div>
              )}
            </div>
          </div>
        </RoutesProvider>
      </LithiaProvider>
    </SocketProvider>
  );
}

export default App;
