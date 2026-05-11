import { Menu, LogOut, User, Settings, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Link } from 'react-router-dom';

export const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950 text-white shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-200 transition hover:bg-white/10 md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden h-10 w-10 items-center justify-center rounded-md bg-emerald-700 text-white md:flex">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Command Ledger
              </p>
              <h1 className="text-base font-bold leading-tight tracking-tight sm:text-lg">
                Military Asset Manager
              </h1>
            </div>
          </div>

          <div className="relative flex items-center gap-3">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-xs font-bold">
                {(user?.fullName || 'U').slice(0, 1)}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block font-semibold leading-none">
                  {user?.fullName || 'User'}
                </span>
                <span className="mt-1 block text-xs text-slate-300">
                  {user?.role || 'Authenticated'}
                </span>
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-14 z-50 min-w-56 overflow-hidden rounded-lg border border-stone-200 bg-white text-slate-950 shadow-xl shadow-slate-900/10">
                <div className="border-b border-stone-200 px-4 py-3">
                  <p className="font-semibold">{user?.fullName}</p>
                  <p className="text-sm text-slate-500">{user?.role}</p>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-stone-50"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-stone-50"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
