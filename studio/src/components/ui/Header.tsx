import ConnectionStatus from './ConnectionStatus';

const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-white/10 py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <img src="/extended-logo.svg" alt="Lithia" className="w-[120px]" />
        <ConnectionStatus />
      </div>
    </header>
  );
};

export default Header;
