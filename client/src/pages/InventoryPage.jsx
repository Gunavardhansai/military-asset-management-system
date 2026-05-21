import { useEffect, useMemo, useState } from 'react';
import { Filter, PackageCheck, RotateCcw, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  assetService,
  baseService,
  inventoryService,
} from '../services/index.js';
import { showToast } from '../utils/toast.js';

const categories = ['Vehicle', 'Weapon', 'Ammunition', 'Equipment', 'Supplies', 'Other'];

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
  category: '',
  minStock: '',
  maxStock: '',
};

export const InventoryPage = () => {
  const { user } = useAuth();
  const commanderBaseId = getBaseId(user?.base);
  const isBaseCommander = user?.role === 'Base Commander';

  const [inventory, setInventory] = useState([]);
  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState(emptyFilters);

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
      showToast.error('Failed to load filter options');
    }
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      const baseFilter = isBaseCommander ? commanderBaseId : filters.base;

      if (baseFilter) params.base = baseFilter;
      if (filters.asset) params.asset = filters.asset;
      if (filters.category) params.category = filters.category;
      if (filters.minStock) params.minStock = filters.minStock;
      if (filters.maxStock) params.maxStock = filters.maxStock;

      const response = await inventoryService.getAll(params);
      setInventory(response.data.data || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      showToast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [page, filters, commanderBaseId, isBaseCommander]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    setPage(1);
  };

  const totals = inventory.reduce(
    (acc, item) => {
      acc.closing += item.closingBalance || 0;
      acc.assigned += item.assigned || 0;
      acc.expended += item.expended || 0;
      return acc;
    },
    { closing: 0, assigned: 0, expended: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Stock Position
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Inventory
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
          <PackageCheck className="h-4 w-4 text-emerald-700" />
          Closing stock: {totals.closing}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="command-surface rounded-lg p-5">
          <p className="text-sm font-semibold text-slate-500">Visible Items</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{inventory.length}</p>
        </div>
        <div className="command-surface rounded-lg p-5">
          <p className="text-sm font-semibold text-slate-500">Assigned Quantity</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{totals.assigned}</p>
        </div>
        <div className="command-surface rounded-lg p-5">
          <p className="text-sm font-semibold text-slate-500">Expended Quantity</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{totals.expended}</p>
        </div>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Filter className="h-4 w-4 text-emerald-700" />
          Filters
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
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

          <select
            value={filters.category}
            onChange={(event) => updateFilter('category', event.target.value)}
            className="field-input"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <input
            min="0"
            type="number"
            value={filters.minStock}
            onChange={(event) => updateFilter('minStock', event.target.value)}
            className="field-input"
            placeholder="Min closing"
            aria-label="Minimum closing stock"
          />

          <input
            min="0"
            type="number"
            value={filters.maxStock}
            onChange={(event) => updateFilter('maxStock', event.target.value)}
            className="field-input"
            placeholder="Max closing"
            aria-label="Maximum closing stock"
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
        <table className="w-full min-w-[1040px]">
          <thead className="border-b border-stone-200 bg-stone-50">
            <tr>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Asset</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Base</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Opening</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Purchases</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Transfer In</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Transfer Out</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Assigned</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Expended</th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">Closing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {loading ? (
              <tr>
                <td colSpan="9" className="px-5 py-10 text-center text-sm text-slate-500">
                  Loading inventory...
                </td>
              </tr>
            ) : inventory.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-5 py-10 text-center text-sm text-slate-500">
                  No inventory found.
                </td>
              </tr>
            ) : (
              inventory.map((inv) => (
                <tr key={inv._id} className="hover:bg-stone-50">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-950">
                      {inv.asset?.name || 'Unknown asset'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {inv.asset?.category || '-'} {inv.asset?.code ? `- ${inv.asset.code}` : ''}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">{inv.base?.name || '-'}</td>
                  <td className="px-5 py-4 text-sm text-slate-900">{inv.openingBalance}</td>
                  <td className="px-5 py-4 text-sm text-blue-700">+{inv.purchases}</td>
                  <td className="px-5 py-4 text-sm text-blue-700">+{inv.transferIn}</td>
                  <td className="px-5 py-4 text-sm text-red-700">-{inv.transferOut}</td>
                  <td className="px-5 py-4 text-sm text-red-700">-{inv.assigned}</td>
                  <td className="px-5 py-4 text-sm text-red-700">-{inv.expended}</td>
                  <td className="px-5 py-4 text-sm font-bold text-emerald-800">
                    {inv.closingBalance}
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
          Total: {total} inventory items
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
            disabled={inventory.length < 10 || loading}
            className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
