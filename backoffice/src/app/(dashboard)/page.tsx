'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatPrice, formatDate } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { TrendingUp, ShoppingBag, BarChart2, DollarSign, Package, Users, Star, Megaphone, AlertTriangle, Truck, TrendingDown, Wallet } from 'lucide-react';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ ventas30: 0, totalPedidos: 0, ticketPromedio: 0, ganancia: 0, gastos30: 0 });
  const [expensesStats, setExpensesStats] = useState({ total30: 0, totalAllTime: 0, byCategory: [] as any[] });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [productsStats, setProductsStats] = useState({ total: 0, active: 0, outOfStock: 0, lowStock: 0, madeToOrder: 0 });
  const [ordersByStatus, setOrdersByStatus] = useState({ PENDING: 0, PAID: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 });
  const [reviewsStats, setReviewsStats] = useState({ total: 0, pending: 0, avgRating: 0 });
  const [marketingStats, setMarketingStats] = useState({ newsletterSubscribers: 0, activePromotions: 0, activeCoupons: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      const data = res.data;
      setKpis(data.kpis || {});
      setExpensesStats(data.expensesStats || { total30: 0, totalAllTime: 0, byCategory: [] });
      setRecentOrders(data.recentOrders || []);
      setTopProducts(data.topProducts || []);
      setProductsStats(data.productsStats || {});
      setOrdersByStatus(data.ordersByStatus || {});
      setReviewsStats(data.reviewsStats || {});
      setMarketingStats(data.marketingStats || {});
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageLoader />;

  const kpiCards = [
    { label: 'Ventas (30 dias)', value: formatPrice(kpis.ventas30), icon: TrendingUp, color: 'bg-green-50 text-green-600', border: 'border-green-200' },
    { label: 'Gastos (30 dias)', value: formatPrice(kpis.gastos30), icon: TrendingDown, color: 'bg-red-50 text-red-600', border: 'border-red-200' },
    { label: 'Balance neto', value: formatPrice(kpis.ganancia), icon: Wallet, color: 'bg-blue-50 text-blue-600', border: 'border-blue-200' },
    { label: 'Total Pedidos', value: String(kpis.totalPedidos), icon: ShoppingBag, color: 'bg-purple-50 text-purple-600', border: 'border-purple-200' },
    { label: 'Ticket Promedio', value: formatPrice(kpis.ticketPromedio), icon: BarChart2, color: 'bg-orange-50 text-orange-600', border: 'border-orange-200' },
  ];

  const statusLabels: Record<string, string> = {
    PENDING: 'Pendientes', PAID: 'Pagados', SHIPPED: 'Enviados', DELIVERED: 'Entregados', CANCELLED: 'Cancelados',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Resumen de actividad del negocio</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {kpiCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={'bg-white rounded-xl border ' + stat.border + ' p-5 flex items-start justify-between shadow-sm'}>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={'p-3 rounded-xl ' + stat.color}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Gastos por categoria */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-500" />Gastos por categoria (30 dias)</h2>
        {expensesStats.byCategory.length > 0 ? (
          <div className="space-y-3">
            {expensesStats.byCategory.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{cat.category}</span>
                <span className="text-sm font-semibold text-red-500">{formatPrice(cat.amount)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Total 30 dias</span>
              <span className="text-sm font-bold text-red-600">{formatPrice(expensesStats.total30)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Total historico</span>
              <span className="text-xs text-gray-400">{formatPrice(expensesStats.totalAllTime)}</span>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-10">No hay gastos registrados en los ultimos 30 dias</p>
        )}
      </div>

      {/* Pedidos por estado */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2"><Truck className="w-4 h-4 text-gray-500" />Pedidos por estado</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(ordersByStatus).map(([status, count]) => (
            <div key={status} className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500">{statusLabels[status] || status}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pedidos recientes */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Pedidos recientes</h2>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{order.number}</p>
                    <p className="text-xs text-gray-400">{order.customer} - {formatDate(order.date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-bold text-gray-900">{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">No hay pedidos todavia</p>
          )}
        </div>

        {/* Top productos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Top Productos</h2>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((p) => (
                <div key={p.rank} className="flex items-center gap-3">
                  <span className={'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ' + (p.rank === 1 ? 'bg-[#C8FF00] text-[#0f172a]' : 'bg-gray-100 text-gray-500')}>
                    {p.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.units} unidades</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 shrink-0">{formatPrice(p.revenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">No hay ventas todavia</p>
          )}
        </div>
      </div>

      {/* Productos / Reviews / Marketing */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-gray-500" />Productos</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-semibold">{productsStats.total}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Activos</span><span className="font-semibold text-green-600">{productsStats.active}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Sin stock</span><span className="font-semibold text-red-600">{productsStats.outOfStock}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Stock bajo</span><span className="font-semibold text-orange-600">{productsStats.lowStock}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Por encargo</span><span className="font-semibold text-purple-600">{productsStats.madeToOrder}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-gray-500" />Reviews</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-semibold">{reviewsStats.total}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Pendientes</span><span className="font-semibold text-amber-600">{reviewsStats.pending}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Promedio</span><span className="font-semibold">{reviewsStats.avgRating} / 5</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2"><Megaphone className="w-4 h-4 text-gray-500" />Marketing</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Newsletter</span><span className="font-semibold">{marketingStats.newsletterSubscribers}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Promociones activas</span><span className="font-semibold">{marketingStats.activePromotions}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Cupones activos</span><span className="font-semibold">{marketingStats.activeCoupons}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}