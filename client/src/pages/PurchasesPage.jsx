import { useState, useEffect } from 'react';
import { purchaseService } from '../services/index.js';
import { showToast } from '../utils/toast.js';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPurchases();
  }, [page]);

  const fetchPurchases = async () => {
    try {
      const response = await purchaseService.getAll({ page, limit: 10 });
      setPurchases(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (error) {
      showToast.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this purchase?')) return;
    try {
      await purchaseService.delete(id);
      showToast.success('Purchase deleted successfully');
      fetchPurchases();
    } catch (error) {
      showToast.error('Failed to delete purchase');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-military-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Purchases</h1>
        <button className="flex items-center gap-2 bg-military-600 text-white px-4 py-2 rounded-md hover:bg-military-700">
          <Plus className="w-5 h-5" />
          New Purchase
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Asset</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Base</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quantity</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cost</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Supplier</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {purchases.map((purchase) => (
              <tr key={purchase._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{purchase.asset?.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{purchase.base?.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{purchase.quantity}</td>
                <td className="px-6 py-4 text-sm text-gray-900">${purchase.totalCost}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{purchase.supplier}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-700">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(purchase._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">Total: {total} purchases</p>
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
