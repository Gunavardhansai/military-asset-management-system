import { Menu, LogOut, User, Settings } from 'lucide-react';
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
    <header className="bg-military-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md hover:bg-military-800 transition"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Military Asset Manager</h1>
          </div>

          <div className="flex items-center gap-4 relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-military-800 transition"
            >
              <User className="w-5 h-5" />
              <span>{user?.fullName || 'User'}</span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-14 bg-white text-gray-900 rounded-md shadow-lg z-50 min-w-48">
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="font-semibold">{user?.fullName}</p>
                  <p className="text-sm text-gray-600">{user?.role}</p>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
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
