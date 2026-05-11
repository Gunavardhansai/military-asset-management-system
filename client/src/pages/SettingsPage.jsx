import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Database,
  Globe2,
  KeyRound,
  RefreshCcw,
  Server,
  Settings,
  ShieldCheck,
  UserCog,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { showToast } from '../utils/toast.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const getHealthUrl = () => {
  try {
    const url = new URL(API_URL);
    return `${url.origin}/health`;
  } catch (error) {
    return '';
  }
};

const SettingTile = ({ label, value, icon: Icon }) => (
  <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
    <div className="flex items-start gap-4">
      <div className="rounded-md bg-emerald-50 p-3 text-emerald-800">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-2 break-words text-sm font-semibold text-slate-950">
          {value}
        </p>
      </div>
    </div>
  </div>
);

const RoleRow = ({ role, scope, tone }) => (
  <div className="flex flex-col gap-2 rounded-md border border-stone-200 bg-stone-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="font-semibold text-slate-950">{role}</p>
      <p className="mt-1 text-sm text-slate-500">{scope}</p>
    </div>
    <span className={`w-fit rounded-md px-2 py-1 text-xs font-semibold ${tone}`}>
      RBAC
    </span>
  </div>
);

export const SettingsPage = () => {
  const { user } = useAuth();
  const [checking, setChecking] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);

  const healthUrl = useMemo(() => getHealthUrl(), []);
  const tokenPresent = Boolean(localStorage.getItem('token'));
  const baseName = typeof user?.base === 'object' ? user.base?.name : user?.base;

  const checkApi = async () => {
    if (!healthUrl) {
      showToast.error('API health URL is not available');
      return;
    }

    setChecking(true);
    try {
      const response = await fetch(healthUrl);
      setApiStatus(response.ok ? 'online' : 'warning');
      showToast[response.ok ? 'success' : 'warning'](
        response.ok ? 'API is reachable' : 'API responded with a warning'
      );
    } catch (error) {
      setApiStatus('offline');
      showToast.error('API health check failed');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">
            System Controls
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Settings
          </h1>
        </div>
        <button
          type="button"
          onClick={checkApi}
          disabled={checking}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          <RefreshCcw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
          {checking ? 'Checking' : 'Check API'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SettingTile label="API Endpoint" value={API_URL} icon={Server} />
        <SettingTile
          label="Frontend Mode"
          value={import.meta.env.VITE_NODE_ENV || import.meta.env.MODE || 'development'}
          icon={Globe2}
        />
        <SettingTile
          label="Session Token"
          value={tokenPresent ? 'Present' : 'Missing'}
          icon={KeyRound}
        />
        <SettingTile
          label="API Health"
          value={apiStatus ? apiStatus.toUpperCase() : 'Not checked'}
          icon={apiStatus === 'offline' ? XCircle : CheckCircle2}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Current Session</h2>
              <p className="mt-1 text-sm text-slate-500">
                {user?.email || 'No signed-in user'}
              </p>
            </div>
            <div className="rounded-md bg-emerald-50 p-3 text-emerald-800">
              <UserCog className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="text-sm font-medium text-slate-500">Name</span>
              <span className="text-sm font-semibold text-slate-950">
                {user?.fullName || '-'}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="text-sm font-medium text-slate-500">Role</span>
              <span className="text-sm font-semibold text-slate-950">
                {user?.role || '-'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Base</span>
              <span className="text-sm font-semibold text-slate-950">
                {baseName || 'Global'}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Security Policy</h2>
              <p className="mt-1 text-sm text-slate-500">Role and data boundaries</p>
            </div>
            <div className="rounded-md bg-emerald-50 p-3 text-emerald-800">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-3">
            <RoleRow
              role="Admin"
              scope="Global access to users, bases, assets, audit logs, and operations."
              tone="bg-emerald-100 text-emerald-800"
            />
            <RoleRow
              role="Base Commander"
              scope="Base-level assignments, expenditures, transfer approvals, and receipts."
              tone="bg-amber-100 text-amber-800"
            />
            <RoleRow
              role="Logistics Officer"
              scope="Purchases, transfer creation, inventory visibility, and movement tracking."
              tone="bg-blue-100 text-blue-800"
            />
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-md bg-emerald-50 p-3 text-emerald-800">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Data Movement Rules</h2>
            <p className="mt-1 text-sm text-slate-500">Inventory balance logic</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            ['Purchases', 'Increase stock at the selected base.'],
            ['Transfers', 'Move stock out of one base and into another after approval.'],
            ['Assignments and Expenditures', 'Reduce available balance until returned or recorded as consumed.'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border border-stone-200 bg-stone-50 p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-white text-emerald-800">
                <Settings className="h-4 w-4" />
              </div>
              <p className="font-semibold text-slate-950">{label}</p>
              <p className="mt-2 text-sm text-slate-500">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
