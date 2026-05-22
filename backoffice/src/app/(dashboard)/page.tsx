// Main Dashboard page — the home screen of the BackOffice.
// Shows KPI stat cards, a weekly sales bar chart (Recharts),
// the 5 most recent orders, and the top 5 selling products.
// Data is currently static/mock; replace fetch calls with real API calls in production.

'use client';

import { formatPrice, formatDate } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/ui/Badge';
import {
  TrendingUp,
  ShoppingBag,
  BarChart2,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Mock data ────────────────────────────────────────────────────────────────
const stats = [
  {
    label: 'Ventas (30 días)',
    value: formatPrice(847500),
    change: '+12.4%',
    icon: TrendingUp,
    color: 'bg-green-50 text-green-600',
    border: 'border-green-200',
  },
  {
    label: 'Total Pedidos',
    value: '164',
    change: '+8.1%',
    icon: ShoppingBag,
    color: 'bg-blue-50 text-blue-600',
    border: 'border-blue-200',
  },
  {
    label: 'Ticket Promedio',
    value: formatPrice(5167),
    change: '+3.7%',
    icon: BarChart2,
    color: 'bg-purple-50 text-purple-600',
    border: 'border-purple-200',
  },
  {
    label: 'Ganancia estimada',
    value: formatPrice(254250),
    change: '+15.2%',
    icon: DollarSign,
    color: 'bg-yellow-50 text-yellow-600',
    border: 'border-yellow-200',
  },
];

const weeklyData = [
  { day: 'Lun', ventas: 42000 },
  { day: 'Mar', ventas: 78500 },
  { day: 'Mié', ventas: 55000 },
  { day: 'Jue', ventas: 91000 },
  { day: 'Vie', ventas: 125000 },
  { day: 'Sáb', ventas: 148000 },
  { day: 'Dom', ventas: 67000 },
];

const recentOrders = [
  { id: '#ORD-0041', customer: 'Martín López', total: 12900, status: 'PAID', date: '2024-11-10T10:00:00Z' },
  { id: '#ORD-0040', customer: 'Sofía García', total: 8750, status: 'SHIPPED', date: '2024-11-09T14:30:00Z' },
  { id: '#ORD-0039', customer: 'Lucía Fernández', total: 34500, status: 'DELIVERED', date: '2024-11-09T09:15:00Z' },
  { id: '#ORD-0038', customer: 'Diego Torres', total: 5200, status: 'PENDING', date: '2024-11-08T18:00:00Z' },
  { id: '#ORD-0037', customer: 'Ana Martínez', total: 16800, status: 'CANCELLED', date: '2024-11-08T11:45:00Z' },
];

const topProducts = [
  { rank: 1, name: 'Pala Bullpadel Vertex 03', units: 38, revenue: 760000 },
  { rank: 2, name: 'Zapatillas Nox AT10 Lux', units: 52, revenue: 624000 },
  { rank: 3, name: 'Pelotas Dunlop Pro x3', units: 120, revenue: 180000 },
  { rank: 4, name: 'Bolso Adidas Padel', units: 29, revenue: 145000 },
  { rank: 5, name: 'Grip Overgrip Pack x10', units: 94, revenue: 94000 },
];

// ─── Custom tooltip for the chart ────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] text-white px-3 py-2 rounded-lg text-sm shadow-xl">
        <p className="font-semibold mb-0.5">{label}</p>
        <p className="text-[#C8FF00]">{formatPrice(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

// ─── Page component ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Resumen de actividad del negocio</p>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-white rounded-xl border ${stat.border} p-5 flex items-start justify-between shadow-sm`}
            >
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium mt-1">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.change} vs. mes anterior
                </span>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Chart + Top Products ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Ventas últimos 7 días</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="ventas" fill="#C8FF00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Top Productos</h2>
          <div className="space-y-3">
            {topProducts.map((p) => (
              <div key={p.rank} className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    p.rank === 1
                      ? 'bg-[#C8FF00] text-[#0f172a]'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {p.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.units} unidades</p>
                </div>
                <span className="text-sm font-semibold text-gray-700 shrink-0">
                  {formatPrice(p.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Orders ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Pedidos recientes</h2>
          <a href="/pedidos" className="text-sm text-[#0f172a] font-medium hover:text-[#C8FF00] transition-colors">
            Ver todos →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Número', 'Cliente', 'Total', 'Estado', 'Fecha'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3.5 font-mono font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-3.5 text-gray-700">{order.customer}</td>
                  <td className="px-6 py-3.5 font-semibold text-gray-900">{formatPrice(order.total)}</td>
                  <td className="px-6 py-3.5">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-3.5 text-gray-500">{formatDate(order.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
