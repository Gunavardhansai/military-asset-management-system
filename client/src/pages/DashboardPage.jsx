import { useEffect, useState } from 'react';
import { dashboardService } from '../services/index.js';
import { showToast } from '../utils/toast.js';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderColor: color }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-full`} style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
    </div>
  </div>
);

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, monthlyRes, distRes] = await Promise.all([
          dashboardService.getStats({}),
          dashboardService.getMonthlyMovement({}),
          dashboardService.getAssetDistribution({}),
        ]);

        setStats(statsRes.data.data);
        setMonthlyData(monthlyRes.data.data);
        setDistributionData(distRes.data.data);
      } catch (error) {
        showToast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-military-600"></div>
      </div>
    );
  }

  const COLORS = ['#438aab', '#3c7a9a', '#2d5d77', '#1e4054'];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Opening Balance"
          value={stats?.openingBalance || 0}
          icon={() => <span>📊</span>}
          color="#438aab"
        />
        <StatCard
          title="Closing Balance"
          value={stats?.closingBalance || 0}
          icon={() => <span>📈</span>}
          color="#3c7a9a"
        />
        <StatCard
          title="Net Movement"
          value={stats?.netMovement || 0}
          icon={() => <span>🔄</span>}
          color="#2d5d77"
        />
        <StatCard
          title="Total Expended"
          value={stats?.expenditures || 0}
          icon={() => <span>🗑️</span>}
          color="#1e4054"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Movement Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Movement</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id.month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="purchases"
                stroke="#438aab"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Distribution Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ _id, total }) => `${_id}: ${total}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
