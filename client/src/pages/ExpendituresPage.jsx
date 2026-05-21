import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  AlertTriangle,
  ClipboardList,
  Flame,
  PackageMinus,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  assetService,
  baseService,
  expenditureService,
} from '../services/index.js';
import { showToast } from '../utils/toast.js';

const today = new Date().toISOString().slice(0, 10);

const getBaseId = (base) => {
  if (!base) return '';
  if (typeof base === 'string') return base;
  return base._id || base.id || '';
};

const getBaseName = (base) => {
  if (!base) return 'Assigned Base';
  if (typeof base === 'string') return 'Assigned Base';
  return base.name || 'Assigned Base';
};

const createEmptyForm = (base = '') => ({
  asset: '',
  base,
  quantity: 1,
  reason: 'Usage',
  expenditureDate: today,
  description: '',
  notes: '',
});

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
  const commanderBaseId = getBaseId(user?.base);
  const isBaseCommander = user?.role === 'Base Commander';
  const [expenditures, setExpenditures] = useState([]);
  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reason, setReason] = useState('');
  const [form, setForm] = useState(() => createEmptyForm(commanderBaseId));

  const visibleBases = useMemo(() => {
    if (!isBaseCommander) return bases;

    const assignedBase = bases.find((base) => base._id === commanderBaseId);
    return assignedBase
      ? [assignedBase]
      : [{ _id: commanderBaseId, name: getBaseName(user?.base), code: '' }].filter((base) => base._id);
  }, [bases, commanderBaseId, isBaseCommander, user?.base]);

  const fetchOptions = async () => {
    try {
      const [assetResponse, baseResponse] = await Promise.all([
        assetService.getAll({ limit: 100 }),
        baseService.getAll({ limit: 100 }),
      ]);
      setAssets(assetResponse.data.data || []);
      setBases(baseResponse.data.data || []);
    } catch (error) {
      showToast.error('Failed to load expenditure form options');
    }
  };

  const fetchExpenditures = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (reason) params.reason = reason;
      if (isBaseCommander) params.base = commanderBaseId;

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
  }, [page, reason, isBaseCommander, commanderBaseId]);

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    if (isBaseCommander && commanderBaseId) {
      setForm((current) => ({ ...current, base: commanderBaseId }));
    }
  }, [commanderBaseId, isBaseCommander]);

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

  const updateForm = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(createEmptyForm(isBaseCommander ? commanderBaseId : ''));
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!form.asset || !form.base) {
      showToast.error('Please select an asset and base');
      return;
    }

    setSaving(true);
    try {
      await expenditureService.create({
        ...form,
        quantity: Number(form.quantity),
      });
      showToast.success('Expenditure added successfully');
      setShowForm(false);
      resetForm();
      fetchExpenditures();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to add expenditure');
    } finally {
      setSaving(false);
    }
  };

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
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
            <Search className="h-4 w-4 text-emerald-700" />
            {total} records
          </div>
          <button
            type="button"
            onClick={() => setShowForm((current) => !current)}
            className="primary-button"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? 'Close' : 'Add Expenditure'}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-2">
              <span className="field-label">Asset</span>
              <select
                required
                value={form.asset}
                onChange={(event) => updateForm('asset', event.target.value)}
                className="field-input"
              >
                <option value="">Select asset</option>
                {assets.map((asset) => (
                  <option key={asset._id} value={asset._id}>
                    {asset.name} ({asset.code})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="field-label">Base</span>
              <select
                required
                value={form.base}
                disabled={isBaseCommander}
                onChange={(event) => updateForm('base', event.target.value)}
                className="field-input disabled:bg-stone-100"
              >
                <option value="">Select base</option>
                {visibleBases.map((base) => (
                  <option key={base._id} value={base._id}>
                    {base.name} {base.code ? `(${base.code})` : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="field-label">Quantity</span>
              <input
                required
                min="1"
                type="number"
                value={form.quantity}
                onChange={(event) => updateForm('quantity', event.target.value)}
                className="field-input"
              />
            </label>

            <label className="space-y-2">
              <span className="field-label">Reason</span>
              <select
                required
                value={form.reason}
                onChange={(event) => updateForm('reason', event.target.value)}
                className="field-input"
              >
                <option value="Usage">Usage</option>
                <option value="Loss">Loss</option>
                <option value="Damage">Damage</option>
                <option value="Obsolete">Obsolete</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="field-label">Date</span>
              <input
                required
                type="date"
                value={form.expenditureDate}
                onChange={(event) => updateForm('expenditureDate', event.target.value)}
                className="field-input"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="field-label">Description</span>
              <input
                value={form.description}
                onChange={(event) => updateForm('description', event.target.value)}
                className="field-input"
                placeholder="Optional"
              />
            </label>

            <label className="space-y-2">
              <span className="field-label">Notes</span>
              <input
                value={form.notes}
                onChange={(event) => updateForm('notes', event.target.value)}
                className="field-input"
                placeholder="Optional"
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={saving} className="primary-button">
              <Plus className="h-4 w-4" />
              {saving ? 'Saving' : 'Add Expenditure'}
            </button>
          </div>
        </form>
      )}

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
