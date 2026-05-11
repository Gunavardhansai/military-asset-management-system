import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  AlertTriangle,
  ClipboardList,
  Flame,
  PackageMinus,
  Search,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { expenditureService } from '../services/index.js';
import { showToast } from '../utils/toast.js';

const getBaseId = (base) => {
  if (!base) return '';
  if (typeof base === 'string') return base;
  return base._id || base.id || '';
};

const reasonTone = {
  Usage: 'bg-emerald-50 text-emerald-800 ring-emerald-700/10',
  Loss: 'bg-red-50 text-red-800 ring-red-700/10',
  Damage: 'bg-amber-50 text-amber-800 ring-amber-700/10',
  Obsolete: 'bg-slate-100 text-slate-700 ring-slate-700/10',
  Other: 'bg-blue-50 text-blue-800 ring-blue-700/10',
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

export const ExpendituresPage = () => {
  const { user } = useAuth();
  const [expenditures, setExpenditures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reason, setReason] = useState('');

  const fetchExpenditures = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (reason) params.reason = reason;
      if (user?.role === 'Base Commander') params.base = getBaseId(user.base);

      const response = await expenditureService.getAll(params);
      setExpenditures(response.data.data || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      showToast.error('Failed to load expenditures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenditures();
  }, [page, reason, user?.role, user?.base]);

  const summary = useMemo(() => {
    return expenditures.reduce(
      (acc, expenditure) => {
        acc.quantity += expenditure.quantity || 0;
        if (expenditure.reason === 'Loss') acc.losses += expenditure.quantity || 0;
        if (expenditure.reason === 'Damage') acc.damaged += expenditure.quantity || 0;
        return acc;
      },
      { quantity: 0, losses: 0, damaged: 0 }
    );
  }, [expenditures]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Consumption Register
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Expenditures
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
          <Search className="h-4 w-4 text-emerald-700" />
          {total} records
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <SummaryCard
          label="Visible Records"
          value={expenditures.length}
          icon={ClipboardList}
          tone="bg-emerald-50 text-emerald-800"
        />
        <SummaryCard
          label="Quantity Expended"
          value={summary.quantity}
          icon={PackageMinus}
          tone="bg-red-50 text-red-800"
        />
        <SummaryCard
          label="Loss or Damage"
          value={summary.losses + summary.damaged}
          icon={AlertTriangle}
          tone="bg-amber-50 text-amber-800"
        />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="field-label" htmlFor="expenditure-reason">
          Reason
        </label>
        <select
          id="expenditure-reason"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            setPage(1);
          }}
          className="field-input max-w-xs"
        >
          <option value="">All reasons</option>
          <option value="Usage">Usage</option>
          <option value="Loss">Loss</option>
          <option value="Damage">Damage</option>
          <option value="Obsolete">Obsolete</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px]">
          <thead className="border-b border-stone-200 bg-stone-50">
            <tr>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">
                Asset
              </th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">
                Base
              </th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">
                Quantity
              </th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">
                Reason
              </th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">
                Date
              </th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">
                Approved By
              </th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-5 py-10 text-center text-sm text-slate-500">
                  Loading expenditures...
                </td>
              </tr>
            ) : expenditures.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-5 py-10 text-center text-sm text-slate-500">
                  No expenditures found.
                </td>
              </tr>
            ) : (
              expenditures.map((expenditure) => (
                <tr key={expenditure._id} className="hover:bg-stone-50">
                  <td className="px-5 py-4 text-sm font-semibold text-slate-950">
                    {expenditure.asset?.name || 'Unknown asset'}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {expenditure.base?.name || 'No base'}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-950">
                    {expenditure.quantity}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ring-1 ${
                        reasonTone[expenditure.reason] || reasonTone.Other
                      }`}
                    >
                      <Flame className="h-3 w-3" />
                      {expenditure.reason}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {expenditure.expenditureDate
                      ? format(new Date(expenditure.expenditureDate), 'MMM dd, yyyy')
                      : '-'}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {expenditure.approvedBy?.fullName || expenditure.createdBy?.fullName || '-'}
                  </td>
                  <td className="max-w-xs px-5 py-4 text-sm text-slate-600">
                    <span className="line-clamp-2">
                      {expenditure.description || expenditure.notes || '-'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">Total: {total} expenditures</p>
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
            disabled={expenditures.length < 10 || loading}
            className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
