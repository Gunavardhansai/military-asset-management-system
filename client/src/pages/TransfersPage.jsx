import { useState, useEffect } from 'react';
import { transferService } from '../services/index.js';
import { showToast } from '../utils/toast.js';
import { Plus } from 'lucide-react';

export const TransfersPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchTransfers();
  }, [page]);

  const fetchTransfers = async () => {
    try {
      const response = await transferService.getAll({ page, limit: 10 });
      setTransfers(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (error) {
      showToast.error('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await transferService.approve(id);
      showToast.success('Transfer approved');
      fetchTransfers();
    } catch (error) {
      showToast.error('Failed to approve transfer');
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Transfers</h1>
        <button className="flex items-center gap-2 bg-military-600 text-white px-4 py-2 rounded-md hover:bg-military-700">
          <Plus className="w-5 h-5" />
          New Transfer
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Asset</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">From Base</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">To Base</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quantity</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transfers.map((transfer) => (
              <tr key={transfer._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{transfer.asset?.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{transfer.fromBase?.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{transfer.toBase?.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{transfer.quantity}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    transfer.status === 'Received' ? 'bg-green-100 text-green-800' :
                    transfer.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {transfer.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {transfer.status === 'Pending' && (
                    <button
                      onClick={() => handleApprove(transfer._id)}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">Total: {total} transfers</p>
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
