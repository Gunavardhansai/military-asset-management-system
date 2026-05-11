import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  MapPinned,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { baseService, userService } from '../services/index.js';
import { showToast } from '../utils/toast.js';

const roleTone = {
  Admin: 'bg-emerald-50 text-emerald-800 ring-emerald-700/10',
  'Base Commander': 'bg-amber-50 text-amber-800 ring-amber-700/10',
  'Logistics Officer': 'bg-blue-50 text-blue-800 ring-blue-700/10',
};

const SummaryCard = ({ label, value, icon: Icon, tone }) => (
  <div className="command-surface rounded-lg p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          {value}
        </p>
      </div>
      <div className={`rounded-md p-3 ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [role, setRole] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (role) params.role = role;

      const [usersRes, basesRes] = await Promise.all([
        userService.getAll(params),
        baseService.getAll({ page: 1, limit: 100 }),
      ]);

      setUsers(usersRes.data.data || []);
      setTotal(usersRes.data.pagination?.total || 0);
      setBases(basesRes.data.data || []);
    } catch (error) {
      showToast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, role]);

  const summary = useMemo(() => {
    return users.reduce(
      (acc, account) => {
        acc.active += account.isActive ? 1 : 0;
        acc.admins += account.role === 'Admin' ? 1 : 0;
        return acc;
      },
      { active: 0, admins: 0 }
    );
  }, [users]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Access Control
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Users Management
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
          <Search className="h-4 w-4 text-emerald-700" />
          {total} accounts
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <SummaryCard
          label="Visible Accounts"
          value={users.length}
          icon={Users}
          tone="bg-emerald-50 text-emerald-800"
        />
        <SummaryCard
          label="Active Accounts"
          value={summary.active}
          icon={UserCheck}
          tone="bg-blue-50 text-blue-800"
        />
        <SummaryCard
          label="Bases"
          value={bases.length}
          icon={MapPinned}
          tone="bg-amber-50 text-amber-800"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="field-label" htmlFor="user-role">
              Role
            </label>
            <select
              id="user-role"
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                setPage(1);
              }}
              className="field-input max-w-xs"
            >
              <option value="">All roles</option>
              <option value="Admin">Admin</option>
              <option value="Base Commander">Base Commander</option>
              <option value="Logistics Officer">Logistics Officer</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
            <table className="w-full min-w-[860px]">
              <thead className="border-b border-stone-200 bg-stone-50">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">
                    User
                  </th>
                  <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">
                    Role
                  </th>
                  <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">
                    Base
                  </th>
                  <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">
                    Last Login
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-10 text-center text-sm text-slate-500">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-10 text-center text-sm text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((account) => (
                    <tr key={account.id || account._id} className="hover:bg-stone-50">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-950">
                          {account.fullName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{account.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ring-1 ${
                            roleTone[account.role] || roleTone['Logistics Officer']
                          }`}
                        >
                          <ShieldCheck className="h-3 w-3" />
                          {account.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {account.base?.name || 'Global'}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ring-1 ${
                            account.isActive
                              ? 'bg-emerald-50 text-emerald-800 ring-emerald-700/10'
                              : 'bg-red-50 text-red-800 ring-red-700/10'
                          }`}
                        >
                          {account.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-700">
                        {account.lastLogin
                          ? format(new Date(account.lastLogin), 'MMM dd, yyyy HH:mm')
                          : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">Total: {total} users</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1 || loading}
                className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-2 text-sm font-semibold text-slate-700">Page {page}</span>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={users.length < 10 || loading}
                className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <aside className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Base Command</h2>
          <div className="mt-4 space-y-3">
            {bases.length === 0 ? (
              <p className="text-sm text-slate-500">No bases found.</p>
            ) : (
              bases.slice(0, 6).map((base) => (
                <div
                  key={base._id}
                  className="rounded-md border border-stone-200 bg-stone-50 px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-950">{base.name}</p>
                    <span className="text-xs font-bold text-emerald-800">{base.code}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{base.location}</p>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
