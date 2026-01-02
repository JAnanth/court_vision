import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-white backdrop-blur-lg py-4 px-[5%] border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-black tracking-tight text-primary uppercase font-display"
        >
          COURTVISION
        </Link>
        <div className="flex gap-10 items-center">
          <Link
            to="/"
            className={`font-semibold text-sm tracking-wide transition-colors ${
              location.pathname === '/' ? 'text-primary' : 'text-slate-500 hover:text-primary'
            }`}
          >
            Home
          </Link>
          <Link
            to="/workspace"
            className={`font-semibold text-sm tracking-wide transition-colors ${
              location.pathname === '/workspace' ? 'text-primary' : 'text-slate-500 hover:text-primary'
            }`}
          >
            Workspace
          </Link>
          <Link
            to="/workspace"
            className="bg-primary text-white px-6 py-2.5 rounded-md font-bold text-sm uppercase tracking-wider hover:bg-primary-dark transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
