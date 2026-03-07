import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuit', starter: 'Starter', pro: 'Pro', agency: 'Agency', admin: 'Admin',
};

export default function Navbar() {
  const { user, logout } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="bg-primary text-white h-14 flex items-center px-6 gap-6 shrink-0">
      <Link to="/" className="font-bold text-lg tracking-tight text-white">
        WebWidget
      </Link>

      <nav className="hidden md:flex items-center gap-4 flex-1 text-sm">
        <Link to="/" className="opacity-80 hover:opacity-100 transition-opacity">Dashboard</Link>
        <Link to="/widgets/new" className="opacity-80 hover:opacity-100 transition-opacity">Nouveau widget</Link>
      </nav>

      {user && (
        <div className="relative ml-auto">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="flex items-center gap-2 text-sm opacity-90 hover:opacity-100 transition-opacity"
          >
            <div className="w-7 h-7 rounded-full bg-accent text-brand-text font-bold flex items-center justify-center text-xs">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:block">{user.email}</span>
            <span className="hidden md:block bg-accent/20 text-accent-dark rounded px-2 py-0.5 text-xs font-semibold">
              {PLAN_LABELS[user.plan] || user.plan}
            </span>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1"
              onBlur={() => setMenuOpen(false)}
            >
              <button
                onClick={() => { navigate('/billing'); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-brand-text hover:bg-brand-subtle"
              >
                Facturation
              </button>
              {user.email === (window as any).__SUPERADMIN_EMAIL__ && (
                <button
                  onClick={() => { navigate('/admin'); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-brand-text hover:bg-brand-subtle"
                >
                  Administration
                </button>
              )}
              <hr className="my-1 border-gray-100" />
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Déconnexion
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
