import { useState, useEffect } from 'react';
import { auditLogService } from '../services/index.js';
import { showToast } from '../utils/toast.js';
import { format } from 'date-fns';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
  });

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async () => {
    try {
      const response = await auditLogService.getAll({
        page,
        limit: 20,
        ...filters,
      });
      setLogs(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (error) {
      showToast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-military-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-4">
        <input
          type="text"
          placeholder="Filter by action..."
          value={filters.action}
          onChange={(e) => {
            setFilters({ ...filters, action: e.target.value });
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          placeholder="Filter by resource..."
          value={filters.resource}
          onChange={(e) => {
            setFilters({ ...filters, resource: e.target.value });
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Resource</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Timestamp</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{log.user?.fullName}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{log.resource}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{log.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">Total: {total} logs</p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 border rounded hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
