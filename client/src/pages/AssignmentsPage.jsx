import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  ClipboardCheck,
  PackageCheck,
  Plus,
  RotateCcw,
  Search,
  UserCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  assetService,
  assignmentService,
  baseService,
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
  personnelName: '',
  rank: '',
  quantity: 1,
  assignedDate: today,
  notes: '',
});

const statusTone = {
  Active: 'bg-emerald-50 text-emerald-800 ring-emerald-700/10',
  Returned: 'bg-slate-100 text-slate-700 ring-slate-700/10',
  Lost: 'bg-red-50 text-red-800 ring-red-700/10',
  Damaged: 'bg-amber-50 text-amber-800 ring-amber-700/10',
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

export const AssignmentsPage = () => {
  const { user } = useAuth();
  const commanderBaseId = getBaseId(user?.base);
  const isBaseCommander = user?.role === 'Base Commander';
  const [assignments, setAssignments] = useState([]);
  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [returningId, setReturningId] = useState('');
  const [form, setForm] = useState(() => createEmptyForm(commanderBaseId));

  const canReturn = user?.role === 'Admin' || user?.role === 'Base Commander';

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
      showToast.error('Failed to load assignment form options');
    }
  };

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (status) params.status = status;
      if (isBaseCommander) params.base = commanderBaseId;

      const response = await assignmentService.getAll(params);
      setAssignments(response.data.data || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      showToast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [page, status, isBaseCommander, commanderBaseId]);

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    if (isBaseCommander && commanderBaseId) {
      setForm((current) => ({ ...current, base: commanderBaseId }));
    }
  }, [commanderBaseId, isBaseCommander]);

  const summary = useMemo(() => {
    return assignments.reduce(
      (acc, assignment) => {
        acc.quantity += assignment.quantity || 0;
        acc.active += assignment.status === 'Active' ? 1 : 0;
        acc.returned += assignment.status === 'Returned' ? 1 : 0;
        return acc;
      },
      { quantity: 0, active: 0, returned: 0 }
    );
  }, [assignments]);

  const handleReturn = async (id) => {
    if (!confirm('Mark this assignment as returned?')) return;
    setReturningId(id);
    try {
      await assignmentService.return(id);
      showToast.success('Assignment returned');
      fetchAssignments();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to return assignment');
    } finally {
      setReturningId('');
    }
  };

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
      await assignmentService.create({
        ...form,
        quantity: Number(form.quantity),
      });
      showToast.success('Asset assigned successfully');
      setShowForm(false);
      resetForm();
      fetchAssignments();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to assign asset');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Personnel Issue Ledger
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Assignments
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
            {showForm ? 'Close' : 'Assign Asset'}
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
              <span className="field-label">Personnel</span>
              <input
                required
                value={form.personnelName}
                onChange={(event) => updateForm('personnelName', event.target.value)}
                className="field-input"
                placeholder="Name"
              />
            </label>

            <label className="space-y-2">
              <span className="field-label">Rank</span>
              <input
                required
                value={form.rank}
                onChange={(event) => updateForm('rank', event.target.value)}
                className="field-input"
                placeholder="Rank"
              />
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
              <span className="field-label">Assigned Date</span>
              <input
                required
                type="date"
                value={form.assignedDate}
                onChange={(event) => updateForm('assignedDate', event.target.value)}
                className="field-input"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
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
              {saving ? 'Saving' : 'Create Assignment'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <SummaryCard
          label="Visible Assignments"
          value={assignments.length}
          icon={ClipboardCheck}
          tone="bg-emerald-50 text-emerald-800"
        />
        <SummaryCard
          label="Active Issues"
          value={summary.active}
          icon={UserCheck}
          tone="bg-amber-50 text-amber-800"
        />
        <SummaryCard
          label="Quantity Issued"
          value={summary.quantity}
          icon={PackageCheck}
          tone="bg-slate-100 text-slate-800"
        />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="field-label" htmlFor="assignment-status">
          Status
        </label>
        <select
          id="assignment-status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="field-input max-w-xs"
        >
          <option value="">All statuses</option>
          <option value="Active">Active</option>
          <option value="Returned">Returned</option>
          <option value="Lost">Lost</option>
          <option value="Damaged">Damaged</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[920px]">
          <thead className="border-b border-stone-200 bg-stone-50">
            <tr>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">
                Personnel
              </th>
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
                Status
              </th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">
                Assigned
              </th>
              <th className="px-5 py-3 text-left text-sm font-semibold text-slate-900">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-5 py-10 text-center text-sm text-slate-500">
                  Loading assignments...
                </td>
              </tr>
            ) : assignments.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-5 py-10 text-center text-sm text-slate-500">
                  No assignments found.
                </td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment._id} className="hover:bg-stone-50">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-950">
                      {assignment.personnelName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{assignment.rank}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {assignment.asset?.name || 'Unassigned asset'}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {assignment.base?.name || 'No base'}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-950">
                    {assignment.quantity}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ring-1 ${
                        statusTone[assignment.status] || statusTone.Active
                      }`}
                    >
                      {assignment.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">
                    {assignment.assignedDate
                      ? format(new Date(assignment.assignedDate), 'MMM dd, yyyy')
                      : '-'}
                  </td>
                  <td className="px-5 py-4">
                    {assignment.status === 'Active' && canReturn ? (
                      <button
                        type="button"
                        onClick={() => handleReturn(assignment._id)}
                        disabled={returningId === assignment._id}
                        className="inline-flex items-center gap-2 rounded-md border border-emerald-700/20 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:opacity-60"
                      >
                        <RotateCcw className="h-4 w-4" />
                        {returningId === assignment._id ? 'Returning' : 'Return'}
                      </button>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">Total: {total} assignments</p>
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
            disabled={assignments.length < 10 || loading}
            className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
