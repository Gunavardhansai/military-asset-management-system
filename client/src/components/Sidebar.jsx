import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  ArrowRightLeft,
  Users,
  Gift,
  Trash2,
  ScrollText,
  Settings,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Base Commander', 'Logistics Officer'] },
  { path: '/purchases', label: 'Purchases', icon: ShoppingCart, roles: ['Admin', 'Logistics Officer'] },
  { path: '/transfers', label: 'Transfers', icon: ArrowRightLeft, roles: ['Admin', 'Logistics Officer'] },
  { path: '/assignments', label: 'Assignments', icon: Users, roles: ['Admin', 'Base Commander'] },
  { path: '/expenditures', label: 'Expenditures', icon: Trash2, roles: ['Admin', 'Base Commander'] },
  { path: '/inventory', label: 'Inventory', icon: BarChart3, roles: ['Admin', 'Base Commander', 'Logistics Officer'] },
  { path: '/audit-logs', label: 'Audit Logs', icon: ScrollText, roles: ['Admin'] },
  { path: '/users', label: 'Users', icon: Users, roles: ['Admin'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['Admin'] },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-military-800 text-white transform transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-6 space-y-2 h-screen overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition ${
                  isActive
                    ? 'bg-military-600 text-white'
                    : 'hover:bg-military-700 text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
