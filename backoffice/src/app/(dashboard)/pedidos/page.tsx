'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Eye } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; sku: string; images?: string[] };
}

interface Order {
  id: string;
  number: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  createdAt: string;
  user?: { name: string; email: string };
  items?: OrderItem[];
}

type StatusFilter = 'ALL' | 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

const STATUS_TABS: { value: StatusFilter; label: string; color: string }[] = [
  { value: 'ALL', label: 'Todos', color: 'bg-gray-100 text-gray-600' },
  { value: 'PENDING', label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
  { value: 'PAID', label: 'Pagado', color: 'bg-blue-100 text-blue-700' },
  { value: 'SHIPPED', label: 'Enviado', color: 'bg-purple-100 text-purple-700' },
  { value: 'DELIVERED', label: 'Entregado', color: 'bg-green-100 text-green-700' },
  { value: 'CANCELLED', label: 'Cancelado', color: 'bg-red-100 text-red-700' },
];

const STATUS_OPTIONS = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente', PAID: 'Pagado', SHIPPED: 'Enviado', DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
};

export default function PedidosPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      const data = res.data?.value || res.data?.data || res.data;
      setOrders(Array.isArray(data) ? data : []);
    } catch { setOrders([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = statusFilter === 'ALL' ? orders : orders.filter((o) => o.status === statusFilter);
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await api.patch('/orders/' + orderId + '/status', { status: newStatus });
      toast('Estado actualizado', 'success');
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
    } catch { toast('Error', 'error'); } finally { setUpdatingStatus(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-500 text-sm mt-0.5">{filtered.length} pedidos</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button key={tab.value} onClick={() => { setStatusFilter(tab.value); setCurrentPage(1); }}
            className={'px-4 py-2 rounded-lg text-sm font-medium transition-all ' +
              (statusFilter === tab.value ? 'bg-[#C8FF00] text-[#0f172a]' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')}>
            {tab.label}
            <span className="ml-2 text-xs opacity-60">({tab.value === 'ALL' ? orders.length : orders.filter((o) => o.status === tab.value).length})</span>
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Numero</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((o) => {
              const statusInfo = STATUS_TABS.find((t) => t.value === o.status);
              return (
                <tr key={o.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-900 font-semibold">{o.number}</code></td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900 font-medium text-sm">{o.user?.name || 'Invitado'}</p>
                    <p className="text-xs text-gray-400">{o.user?.email || '-'}</p>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-500">{(o.items || []).length} items</td>
                  <td className="px-4 py-3 text-center font-semibold text-sm">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={'text-xs font-medium px-2 py-1 rounded-full ' + (statusInfo?.color || 'bg-gray-100')}>
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => { setSelectedOrder(o); setDetailOpen(true); }}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Ver detalle">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={'w-8 h-8 rounded-lg text-sm font-medium ' + (i + 1 === currentPage ? 'bg-[#C8FF00] text-[#0f172a]' : 'text-gray-500 hover:bg-gray-50')}>{i + 1}</button>
          ))}
        </div>
      )}

      {detailOpen && selectedOrder && (
        <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title={'Pedido ' + selectedOrder.number} size="lg">
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Cliente</p>
                <p className="font-semibold text-gray-900">{selectedOrder.user?.name || 'Invitado'}</p>
                <p className="text-sm text-gray-500">{selectedOrder.user?.email || '-'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Estado</p>
                <select value={selectedOrder.status} disabled={updatingStatus}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Fecha</p>
                <p className="font-medium text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Productos</p>
              <div className="space-y-2">
                {(selectedOrder.items || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-xs text-gray-400">{item.product.sku} x {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0f172a] rounded-xl p-4 text-white space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-400">Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
              {selectedOrder.discount > 0 && <div className="flex justify-between text-sm text-green-400"><span>Descuento</span><span>-{formatPrice(selectedOrder.discount)}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-slate-400">Envio</span><span>{selectedOrder.shipping > 0 ? formatPrice(selectedOrder.shipping) : 'GRATIS'}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-white/10"><span>Total</span><span className="text-[#C8FF00]">{formatPrice(selectedOrder.total)}</span></div>
            </div>
          </div>
        </Modal>
      )}

      {paginated.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <p className="text-gray-400 text-sm">No se encontraron pedidos</p>
        </div>
      )}
    </div>
  );
}
