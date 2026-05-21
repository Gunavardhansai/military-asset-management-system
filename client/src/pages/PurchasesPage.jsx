import { useEffect, useMemo, useState } from 'react';
import { Filter, Plus, RotateCcw, Search, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  assetService,
  baseService,
  purchaseService,
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
  base: '',
  asset: '',
  startDate: '',
  endDate: '',
};

const createEmptyForm = (base = '') => ({
  asset: '',
  base,
  quantity: 1,
  unitCost: '',
  supplier: '',
  purchaseDate: today,
  invoiceNo: '',
  notes: '',
});

export const PurchasesPage = () => {
  const { user } = useAuth();
  const commanderBaseId = getBaseId(user?.base);
  const isBaseCommander = user?.role === 'Base Commander';

  const [purchases, setPurchases] = useState([]);
  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState(emptyFilters);
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
      showToast.error('Failed to load purchase form options');
    }
  };

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      const baseFilter = isBaseCommander ? commanderBaseId : filters.base;

      if (baseFilter) params.base = baseFilter;
      if (filters.asset) params.asset = filters.asset;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await purchaseService.getAll(params);
      setPurchases(response.data.data || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      showToast.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    if (isBaseCommander && commanderBaseId) {
      setForm((current) => ({ ...current, base: commanderBaseId }));
    }
  }, [commanderBaseId, isBaseCommander]);

  useEffect(() => {
    fetchPurchases();
  }, [page, filters, commanderBaseId, isBaseCommander]);

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

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!form.asset || !form.base) {
      showToast.error('Please select an asset and base');
      return;
    }

    setSaving(true);
    try {
      await purchaseService.create({
        ...form,
        quantity: Number(form.quantity),
        unitCost: Number(form.unitCost),
      });
      showToast.success('Purchase added successfully');
      setShowForm(false);
      resetForm();
      fetchPurchases();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to add purchase');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this purchase?')) return;
    try {
      await purchaseService.delete(id);
      showToast.success('Purchase deleted successfully');
      fetchPurchases();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to delete purchase');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Procurement Ledger
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Purchases
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((current) => !current)}
          className="primary-button"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Close' : 'New Purchase'}
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
              <span className="field-label">Unit Cost</span>
              <input
                required
                min="0"
                step="0.01"
                type="number"
                value={form.unitCost}
                onChange={(event) => updateForm('unitCost', event.target.value)}
                className="field-input"
              />
            </label>

            <label className="space-y-2">
              <span className="field-label">Supplier</span>
              <input
                required
                value={form.supplier}
                onChange={(event) => updateForm('supplier', event.target.value)}
                className="field-input"
                placeholder="Supplier name"
              />
            </label>

            <label className="space-y-2">
              <span className="field-label">Purchase Date</span>
              <input
                required
                type="date"
                value={form.purchaseDate}
                onChange={(event) => updateForm('purchaseDate', event.target.value)}
                className="field-input"
              />
            </label>

            <label className="space-y-2">
              <span className="field-label">Invoice No.</span>
              <input
                value={form.invoiceNo}
                onChange={(event) => updateForm('invoiceNo', event.target.value)}
                className="field-input"
                placeholder="Optional"
              />
            </label>

            <label className="space-y-2 lg:col-span-1">
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
              {saving ? 'Saving' : 'Add Purchase'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Filter className="h-4 w-4 text-emerald-700" />
          Filters
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <select
            value={isBaseCommander ? commanderBaseId : filters.base}
            disabled={isBaseCommander}
            onChange={(event) => updateFilter('base', event.target.value)}
            className="field-input disabled:bg-stone-100"
          >
            <option value="">All bases</option>
            {visibleBases.map((base) => (
              <option key={base._id} value={base._id}>
                {base.name}
              </option>
            ))}
          </select>

          <select
            value={filters.asset}
            onChange={(event) => updateFilter('asset', event.target.value)}
            className="field-input"
          >
            <option value="">All assets</option>
            {assets.map((asset) => (
              <option key={asset._id} value={asset._id}>
                {asset.name}
              </option>
            ))}
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
        <table className="w-full min-w-[920px]">
          <thead className="border-b border-stone-200 bg-stone-50">
            <tr>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Asset</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Base</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Quantity</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Cost</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Supplier</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Date</th>
              {user?.role === 'Admin' && (
                <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Action</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {loading ? (
              <tr>
                <td colSpan={user?.role === 'Admin' ? 7 : 6} className="px-5 py-10 text-center text-sm text-slate-500">
                  Loading purchases...
                </td>
              </tr>
            ) : purchases.length === 0 ? (
              <tr>
                <td colSpan={user?.role === 'Admin' ? 7 : 6} className="px-5 py-10 text-center text-sm text-slate-500">
                  No purchases found.
                </td>
              </tr>
            ) : (
              purchases.map((purchase) => (
                <tr key={purchase._id} className="hover:bg-stone-50">
                  <td className="px-5 py-4 text-sm font-semibold text-slate-950">
                    {purchase.asset?.name || 'Unknown asset'}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">{purchase.base?.name || '-'}</td>
                  <td className="px-5 py-4 text-sm text-slate-900">{purchase.quantity}</td>
                  <td className="px-5 py-4 text-sm text-slate-900">
                    ${Number(purchase.totalCost || 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">{purchase.supplier}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {purchase.purchaseDate ? new Date(purchase.purchaseDate).toLocaleDateString() : '-'}
                  </td>
                  {user?.role === 'Admin' && (
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleDelete(purchase._id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-red-700 transition hover:bg-red-50"
                        aria-label="Delete purchase"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Search className="h-4 w-4 text-emerald-700" />
          Total: {total} purchases
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
            disabled={purchases.length < 10 || loading}
            className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
