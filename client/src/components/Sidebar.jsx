import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  ArrowRightLeft,
  Users,
  PackageCheck,
  Trash2,
  ScrollText,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Base Commander', 'Logistics Officer'] },
  { path: '/purchases', label: 'Purchases', icon: ShoppingCart, roles: ['Admin', 'Logistics Officer'] },
  { path: '/transfers', label: 'Transfers', icon: ArrowRightLeft, roles: ['Admin', 'Logistics Officer'] },
  { path: '/assignments', label: 'Assignments', icon: Users, roles: ['Admin', 'Base Commander'] },
  { path: '/expenditures', label: 'Expenditures', icon: Trash2, roles: ['Admin', 'Base Commander'] },
  { path: '/inventory', label: 'Inventory', icon: PackageCheck, roles: ['Admin', 'Base Commander', 'Logistics Officer'] },
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
          className="fixed inset-0 z-30 bg-slate-950/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-800 bg-slate-950 text-white transition-transform duration-300 md:static md:z-auto md:w-64 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-screen flex-col">
          <div className="border-b border-white/10 px-5 py-5 md:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                  Command
                </p>
                <p className="font-bold">Asset Manager</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-950/20'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          </nav>

          <div className="border-t border-white/10 p-4 text-xs text-slate-400">
            <p className="font-medium text-slate-300">Secure session active</p>
            <p className="mt-1">RBAC policies enforced</p>
          </div>
        </div>
      </aside>
    </>
  );
};
