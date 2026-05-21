import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  Filter,
  Plus,
  RotateCcw,
  Search,
  Truck,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  assetService,
  baseService,
  transferService,
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

const emptyFilters = {
  fromBase: '',
  toBase: '',
  status: '',
  startDate: '',
  endDate: '',
};

const createEmptyForm = (fromBase = '') => ({
  asset: '',
  fromBase,
  toBase: '',
  quantity: 1,
  transferDate: today,
  notes: '',
});

const statusTone = {
  Pending: 'bg-amber-50 text-amber-800 ring-amber-700/10',
  'In Transit': 'bg-blue-50 text-blue-800 ring-blue-700/10',
  Received: 'bg-emerald-50 text-emerald-800 ring-emerald-700/10',
  Cancelled: 'bg-slate-100 text-slate-700 ring-slate-700/10',
};

export const TransfersPage = () => {
  const { user } = useAuth();
  const commanderBaseId = getBaseId(user?.base);
  const isBaseCommander = user?.role === 'Base Commander';

  const [transfers, setTransfers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actingId, setActingId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState(emptyFilters);
  const [form, setForm] = useState(() => createEmptyForm(commanderBaseId));

  const fromBaseOptions = useMemo(() => {
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
      showToast.error('Failed to load transfer form options');
    }
  };

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filters.fromBase) params.fromBase = filters.fromBase;
      if (filters.toBase) params.toBase = filters.toBase;
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await transferService.getAll(params);
      setTransfers(response.data.data || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      showToast.error('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    if (isBaseCommander && commanderBaseId) {
      setForm((current) => ({ ...current, fromBase: commanderBaseId }));
    }
  }, [commanderBaseId, isBaseCommander]);

  useEffect(() => {
    fetchTransfers();
  }, [page, filters]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  };

  const updateForm = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    setPage(1);
  };

  const resetForm = () => {
    setForm(createEmptyForm(isBaseCommander ? commanderBaseId : ''));
  };

  const canApprove = (transfer) => {
    if (user?.role === 'Admin') return true;
    return isBaseCommander && getBaseId(transfer.fromBase) === commanderBaseId;
  };

  const canReceive = (transfer) => {
    if (user?.role === 'Admin') return true;
    return isBaseCommander && getBaseId(transfer.toBase) === commanderBaseId;
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!form.asset || !form.fromBase || !form.toBase) {
      showToast.error('Please select an asset, source base, and destination base');
      return;
    }

    if (form.fromBase === form.toBase) {
      showToast.error('Source and destination bases must be different');
      return;
    }

    setSaving(true);
    try {
      await transferService.create({
        ...form,
        quantity: Number(form.quantity),
      });
      showToast.success('Transfer created successfully');
      setShowForm(false);
      resetForm();
      fetchTransfers();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to create transfer');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id) => {
    setActingId(id);
    try {
      await transferService.approve(id);
      showToast.success('Transfer approved');
      fetchTransfers();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to approve transfer');
    } finally {
      setActingId('');
    }
  };

  const handleReceive = async (id) => {
    setActingId(id);
    try {
      await transferService.receive(id);
      showToast.success('Transfer received');
      fetchTransfers();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to receive transfer');
    } finally {
      setActingId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Inter-Base Movement
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Transfers
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((current) => !current)}
          className="primary-button"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Close' : 'New Transfer'}
        </button>
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
              <span className="field-label">From Base</span>
              <select
                required
                value={form.fromBase}
                disabled={isBaseCommander}
                onChange={(event) => updateForm('fromBase', event.target.value)}
                className="field-input disabled:bg-stone-100"
              >
                <option value="">Select source</option>
                {fromBaseOptions.map((base) => (
                  <option key={base._id} value={base._id}>
                    {base.name} {base.code ? `(${base.code})` : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="field-label">To Base</span>
              <select
                required
                value={form.toBase}
                onChange={(event) => updateForm('toBase', event.target.value)}
                className="field-input"
              >
                <option value="">Select destination</option>
                {bases.map((base) => (
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
              <span className="field-label">Transfer Date</span>
              <input
                required
                type="date"
                value={form.transferDate}
                onChange={(event) => updateForm('transferDate', event.target.value)}
                className="field-input"
              />
            </label>

            <label className="space-y-2 md:col-span-2 lg:col-span-3">
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
              <ArrowRightLeft className="h-4 w-4" />
              {saving ? 'Saving' : 'Create Transfer'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Filter className="h-4 w-4 text-emerald-700" />
          Filters
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
          <select
            value={filters.fromBase}
            onChange={(event) => updateFilter('fromBase', event.target.value)}
            className="field-input"
          >
            <option value="">Any source</option>
            {bases.map((base) => (
              <option key={base._id} value={base._id}>
                {base.name}
              </option>
            ))}
          </select>

          <select
            value={filters.toBase}
            onChange={(event) => updateFilter('toBase', event.target.value)}
            className="field-input"
          >
            <option value="">Any destination</option>
            {bases.map((base) => (
              <option key={base._id} value={base._id}>
                {base.name}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(event) => updateFilter('status', event.target.value)}
            className="field-input"
          >
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Transit">In Transit</option>
            <option value="Received">Received</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(event) => updateFilter('startDate', event.target.value)}
            className="field-input"
            aria-label="Start date"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(event) => updateFilter('endDate', event.target.value)}
            className="field-input"
            aria-label="End date"
          />

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-stone-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px]">
          <thead className="border-b border-stone-200 bg-stone-50">
            <tr>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Asset</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">From Base</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">To Base</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Quantity</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-5 py-10 text-center text-sm text-slate-500">
                  Loading transfers...
                </td>
              </tr>
            ) : transfers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-5 py-10 text-center text-sm text-slate-500">
                  No transfers found.
                </td>
              </tr>
            ) : (
              transfers.map((transfer) => (
                <tr key={transfer._id} className="hover:bg-stone-50">
                  <td className="px-5 py-4 text-sm font-semibold text-slate-950">
                    {transfer.asset?.name || 'Unknown asset'}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">{transfer.fromBase?.name || '-'}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{transfer.toBase?.name || '-'}</td>
                  <td className="px-5 py-4 text-sm text-slate-900">{transfer.quantity}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ring-1 ${
                        statusTone[transfer.status] || statusTone.Pending
                      }`}
                    >
                      {transfer.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {transfer.transferDate ? new Date(transfer.transferDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {transfer.status === 'Pending' && canApprove(transfer) && (
                        <button
                          type="button"
                          onClick={() => handleApprove(transfer._id)}
                          disabled={actingId === transfer._id}
                          className="inline-flex items-center gap-2 rounded-md border border-blue-700/20 px-3 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-50 disabled:opacity-60"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {actingId === transfer._id ? 'Approving' : 'Approve'}
                        </button>
                      )}
                      {transfer.status === 'In Transit' && canReceive(transfer) && (
                        <button
                          type="button"
                          onClick={() => handleReceive(transfer._id)}
                          disabled={actingId === transfer._id}
                          className="inline-flex items-center gap-2 rounded-md border border-emerald-700/20 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:opacity-60"
                        >
                          <Truck className="h-4 w-4" />
                          {actingId === transfer._id ? 'Receiving' : 'Receive'}
                        </button>
                      )}
                      {!(transfer.status === 'Pending' && canApprove(transfer)) &&
                        !(transfer.status === 'In Transit' && canReceive(transfer)) && (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Search className="h-4 w-4 text-emerald-700" />
          Total: {total} transfers
        </div>
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
            disabled={transfers.length < 10 || loading}
            className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
