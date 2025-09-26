import { SocketProvider } from '@/contexts/SocketContext';
import Studio from './components/Studio';

function App() {
  return (
    <SocketProvider>
      <Studio />
    </SocketProvider>
  );
}

export default App;
