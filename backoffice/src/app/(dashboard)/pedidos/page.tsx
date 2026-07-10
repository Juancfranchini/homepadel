// Orders (Pedidos) management page for the Home Pádel BackOffice.
// Features:
//  - Status filter tabs: Todos | Pendiente | Pagado | Enviado | Entregado | Cancelado
//  - TanStack Table with pagination
//  - Click a row to open an order detail modal (shows all line items)
//  - Admin can change order status via a dropdown
// API: GET /api/orders, PATCH /api/orders/:id/status

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, Eye, Package } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

// ─── Types ──────────────────────────────────────────────────────────────────
interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: { name: string; sku: string; images?: string[] };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  total: number;
  createdAt: string;
  user?: { name: string; email: string };
  items?: OrderItem[];
}

type StatusFilter = 'ALL' | 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'PAID', label: 'Pagado' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

const STATUS_OPTIONS = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

const col = createColumnHelper<Order>();

// ─── Page ────────────────────────────────────────────────────────────────────
export default function PedidosPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
    } catch {
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = statusFilter === 'ALL'
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const columns = [
    col.accessor('orderNumber', {
      header: 'Número',
      cell: (i) => <span className="font-mono font-semibold text-gray-900">{i.getValue()}</span>,
    }),
    col.accessor('user', {
      header: 'Cliente',
      cell: (i) => (
        <div>
          <p className="font-medium text-gray-800">{i.getValue()?.name ?? 'N/A'}</p>
          <p className="text-xs text-gray-400">{i.getValue()?.email}</p>
        </div>
      ),
    }),
    col.accessor('items', {
      header: 'Items',
      cell: (i) => <span className="text-gray-600">{(i.getValue() ?? []).length} items</span>,
    }),
    col.accessor('subtotal', {
      header: 'Subtotal',
      cell: (i) => <span className="text-gray-700">{formatPrice(i.getValue())}</span>,
    }),
    col.accessor('total', {
      header: 'Total',
      cell: (i) => <span className="font-semibold text-gray-900">{formatPrice(i.getValue())}</span>,
    }),
    col.accessor('status', {
      header: 'Estado',
      cell: (i) => <OrderStatusBadge status={i.getValue()} />,
    }),
    col.accessor('createdAt', {
      header: 'Fecha',
      cell: (i) => <span className="text-gray-500">{formatDate(i.getValue())}</span>,
    }),
    col.display({
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <button
          onClick={() => { setSelectedOrder(row.original); setDetailOpen(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Ver
        </button>
      ),
    }),
  ];

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast('Estado actualizado', 'success');
      // Update local state
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
    } catch {
      toast('Error al actualizar el estado', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-500 text-sm mt-0.5">{filtered.length} pedidos encontrados</p>
      </div>

      {/* Status filter tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 flex gap-1 flex-wrap shadow-sm">
        {STATUS_TABS.map((tab) => {
          const count = tab.value === 'ALL' ? orders.length : orders.filter((o) => o.status === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === tab.value
                  ? 'bg-[#0f172a] text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusFilter === tab.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-50">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3.5 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={`Pedido ${selectedOrder?.orderNumber ?? ''}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-5">
            {/* Customer + status row */}
            <div className="flex flex-wrap gap-4 items-start">
              <div className="flex-1 min-w-[200px] bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Cliente</p>
                <p className="font-semibold text-gray-900">{selectedOrder.user?.name ?? 'N/A'}</p>
                <p className="text-sm text-gray-500">{selectedOrder.user?.email}</p>
              </div>
              <div className="flex-1 min-w-[200px] bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Estado</p>
                <div className="flex items-center gap-2 mt-1">
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
                <select
                  value={selectedOrder.status}
                  disabled={updatingStatus}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="mt-2 w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[160px] bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Fecha</p>
                <p className="font-medium text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
              </div>
            </div>

            {/* Items list */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Productos del pedido</p>
              <div className="space-y-2">
                {(selectedOrder.items ?? []).map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-xs text-gray-400">{item.product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{formatPrice(item.unitPrice * item.quantity)}</p>
                      <p className="text-xs text-gray-400">{item.quantity} × {formatPrice(item.unitPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-[#0f172a] rounded-xl p-4 text-white space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span>{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-white/10">
                <span>Total</span>
                <span className="text-[#C8FF00]">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK_ORDERS: Order[] = [
  {
    id: '1', orderNumber: '#ORD-0041', status: 'PAID', subtotal: 11900, total: 12900,
    createdAt: '2024-11-10T10:00:00Z',
    user: { name: 'Martín López', email: 'martin@email.com' },
    items: [
      { id: '1', quantity: 1, unitPrice: 11900, product: { name: 'Pala Bullpadel Vertex 03', sku: 'BP-VTX-03' } },
    ],
  },
  {
    id: '2', orderNumber: '#ORD-0040', status: 'SHIPPED', subtotal: 8750, total: 8750,
    createdAt: '2024-11-09T14:30:00Z',
    user: { name: 'Sofía García', email: 'sofia@email.com' },
    items: [
      { id: '2', quantity: 2, unitPrice: 3200, product: { name: 'Pelotas Dunlop Pro x3', sku: 'DUN-PRO-3' } },
      { id: '3', quantity: 1, unitPrice: 2350, product: { name: 'Grip Overgrip Pack x10', sku: 'GRP-10' } },
    ],
  },
  {
    id: '3', orderNumber: '#ORD-0039', status: 'DELIVERED', subtotal: 34500, total: 34500,
    createdAt: '2024-11-09T09:15:00Z',
    user: { name: 'Lucía Fernández', email: 'lucia@email.com' },
    items: [
      { id: '4', quantity: 1, unitPrice: 34500, product: { name: 'Zapatillas Nox AT10 Lux', sku: 'NOX-AT10-L' } },
    ],
  },
  {
    id: '4', orderNumber: '#ORD-0038', status: 'PENDING', subtotal: 5200, total: 5200,
    createdAt: '2024-11-08T18:00:00Z',
    user: { name: 'Diego Torres', email: 'diego@email.com' },
    items: [],
  },
  {
    id: '5', orderNumber: '#ORD-0037', status: 'CANCELLED', subtotal: 16800, total: 16800,
    createdAt: '2024-11-08T11:45:00Z',
    user: { name: 'Ana Martínez', email: 'ana@email.com' },
    items: [],
  },
];

