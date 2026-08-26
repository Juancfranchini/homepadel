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
  address: string;
  trackingNumber?: string;
  trackingUrl?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  paymentMethod?: string;
  user?: { name: string; email: string };
  items?: OrderItem[];
}

type StatusFilter = 'ALL' | 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

const STATUS_TABS: { value: StatusFilter; label: string; color: string; bgActive: string; icon: string }[] = [
  { value: 'ALL', label: 'Todos', color: 'bg-gray-50 text-gray-600 border-gray-200', bgActive: 'bg-[#0f172a] border-[#0f172a]', icon: '' },
  { value: 'PENDING', label: 'Pendiente', color: 'bg-amber-50 text-amber-700 border-amber-200', bgActive: 'bg-amber-500 border-amber-500', icon: '' },
  { value: 'PAID', label: 'Pagado', color: 'bg-blue-50 text-blue-700 border-blue-200', bgActive: 'bg-blue-500 border-blue-500', icon: '' },
  { value: 'SHIPPED', label: 'Enviado', color: 'bg-purple-50 text-purple-700 border-purple-200', bgActive: 'bg-purple-500 border-purple-500', icon: '' },
  { value: 'DELIVERED', label: 'Entregado', color: 'bg-green-50 text-green-700 border-green-200', bgActive: 'bg-green-500 border-green-500', icon: '' },
  { value: 'CANCELLED', label: 'Cancelado', color: 'bg-red-50 text-red-700 border-red-200', bgActive: 'bg-red-500 border-red-500', icon: '' },
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
  const páginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleStatusChange = async (orderId: string, newStatus: string, trackingNumber?: string, trackingUrl?: string) => {
    setUpdatingStatus(true);
    try {
      await api.patch('/orders/' + orderId + '/status', { status: newStatus, trackingNumber, trackingUrl });
      toast('Estado actualizado', 'success');
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus, trackingNumber, trackingUrl } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder((prev) => prev ? { ...prev, status: newStatus, trackingNumber, trackingUrl } : prev);
    } catch { toast('Error', 'error'); } finally { setUpdatingStatus(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-500 text-sm mt-0.5">{filtered.length} pedidos</p>
      </div>

      <div className="grid grid-cols-6 gap-2 w-full">
        {STATUS_TABS.map((tab) => {
          const count = tab.value === 'ALL' ? orders.length : orders.filter((o) => o.status === tab.value).length;
          const isActive = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setCurrentPage(1); }}
              className={'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ' +
                (isActive
                  ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300')}
            >
              <span className="flex items-center gap-2 truncate">
                <span className="text-sm leading-none shrink-0">{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
              </span>
              <span className={'text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ' + (isActive ? 'bg-[#C8FF00] text-[#0f172a]' : 'bg-gray-100 text-gray-500')}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Número</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Teléfono</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">Fecha</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {páginated.map((o) => {
              const statusInfo = STATUS_TABS.find((t) => t.value === o.status);
              return (
                <tr key={o.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-900 font-semibold">{o.number}</code></td>
                  <td className="px-3 py-3">
                    <p className="text-gray-900 font-medium text-sm">{o.buyerName || o.user?.name || 'Invitado'}</p>
                    <p className="text-xs text-gray-400">{o.buyerEmail || o.user?.email || '-'}</p>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-500 hidden lg:table-cell">{o.buyerPhone || '-'}</td>
                  <td className="px-3 py-3 text-center text-sm text-gray-500">{(o.items || []).length} items</td>
                  <td className="px-3 py-3 text-center font-semibold text-sm">{formatPrice(o.total)}</td>
                  <td className="px-3 py-3 text-center">
                    <span className={'text-xs font-medium px-2 py-1 rounded-full ' + (statusInfo?.color || 'bg-gray-100')}>
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center text-xs text-gray-500 hidden xl:table-cell">{formatDate(o.createdAt)}</td>
                  <td className="px-3 py-3 text-center">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Cliente</p>
                <p className="font-semibold text-gray-900">{selectedOrder.buyerName || selectedOrder.user?.name || 'Invitado'}</p>
                <p className="text-sm text-gray-500">{selectedOrder.buyerEmail || selectedOrder.user?.email || '-'}</p>
                <p className="text-sm text-gray-500">{selectedOrder.buyerPhone || '-'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Dirección</p>
                <p className="text-sm text-gray-700">{selectedOrder.address}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Medio de pago</p>
                <p className="text-sm text-gray-700">{selectedOrder.paymentMethod || 'No especificado'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Fecha</p>
                <p className="font-medium text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Estado</p>
                <select value={selectedOrder.status} disabled={updatingStatus}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
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
              <div className="flex justify-between text-sm"><span className="text-slate-400">Envío</span><span>{selectedOrder.shipping > 0 ? formatPrice(selectedOrder.shipping) : 'GRATIS'}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-white/10"><span>Total</span><span className="text-[#C8FF00]">{formatPrice(selectedOrder.total)}</span></div>
            </div>
          </div>
        </Modal>
      )}

      {páginated.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <p className="text-gray-400 text-sm">No se encontraron pedidos</p>
        </div>
      )}
    </div>
  );
}
