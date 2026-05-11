import { useState, useEffect } from 'react';
import { inventoryService } from '../services/index.js';
import { showToast } from '../utils/toast.js';

export const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchInventory();
  }, [page]);

  const fetchInventory = async () => {
    try {
      const response = await inventoryService.getAll({ page, limit: 10 });
      setInventory(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (error) {
      showToast.error('Failed to load inventory');
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
      <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Asset</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Base</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Opening</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Purchases</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Transfer In</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Transfer Out</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Assigned</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Expended</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Closing</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {inventory.map((inv) => (
              <tr key={inv._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-900">{inv.asset?.name}</td>
                <td className="px-6 py-4 text-gray-900">{inv.base?.name}</td>
                <td className="px-6 py-4 text-gray-900">{inv.openingBalance}</td>
                <td className="px-6 py-4 text-blue-600">+{inv.purchases}</td>
                <td className="px-6 py-4 text-blue-600">+{inv.transferIn}</td>
                <td className="px-6 py-4 text-red-600">-{inv.transferOut}</td>
                <td className="px-6 py-4 text-red-600">-{inv.assigned}</td>
                <td className="px-6 py-4 text-red-600">-{inv.expended}</td>
                <td className="px-6 py-4 font-semibold text-green-600">{inv.closingBalance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">Total: {total} inventory items</p>
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
