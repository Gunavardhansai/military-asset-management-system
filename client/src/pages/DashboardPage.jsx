import { useEffect, useState } from 'react';
import { dashboardService } from '../services/index.js';
import { showToast } from '../utils/toast.js';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowDownUp,
  Boxes,
  PackageCheck,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, tone }) => (
  <div className="command-surface rounded-lg p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-500">{title}</p>
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
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-stone-200 border-b-emerald-700" />
      </div>
    );
  }

  const COLORS = ['#047857', '#b45309', '#334155', '#0f766e'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">
            Command Overview
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Dashboard
          </h1>
        </div>
        <div className="rounded-md border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-slate-600">
          Live inventory telemetry
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Opening Balance"
          value={stats?.openingBalance || 0}
          icon={Boxes}
          tone="bg-emerald-50 text-emerald-800"
        />
        <StatCard
          title="Closing Balance"
          value={stats?.closingBalance || 0}
          icon={PackageCheck}
          tone="bg-amber-50 text-amber-800"
        />
        <StatCard
          title="Net Movement"
          value={stats?.netMovement || 0}
          icon={ArrowDownUp}
          tone="bg-slate-100 text-slate-800"
        />
        <StatCard
          title="Total Expended"
          value={stats?.expenditures || 0}
          icon={ShieldAlert}
          tone="bg-red-50 text-red-800"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="command-surface rounded-lg p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">
              Monthly Movement
            </h2>
            <TrendingUp className="h-5 w-5 text-emerald-700" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid stroke="#e7e5e4" strokeDasharray="3 3" />
              <XAxis dataKey="_id.month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="purchases"
                stroke="#047857"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="command-surface rounded-lg p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-950">
            Asset Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ _id, total }) => `${_id}: ${total}`}
                outerRadius={82}
                fill="#047857"
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
