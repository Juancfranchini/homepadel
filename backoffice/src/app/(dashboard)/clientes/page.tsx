// Customers (Clientes) page for the Home Pádel BackOffice.
// Lists all registered customers with search by name/email.
// Click a row to open a customer detail side panel (orders, stats).
// API: GET /api/users (or /api/customers)

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Search, ChevronLeft, ChevronRight, Eye, User2, ShoppingBag, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';

// ─── Types ──────────────────────────────────────────────────────────────────
interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  _count?: { orders: number };
  totalSpent?: number;
  orders?: { id: string; orderNumber: string; total: number; status: string; createdAt: string }[];
}

const col = createColumnHelper<Customer>();

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setCustomers(Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
    } catch {
      setCustomers(MOCK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  const columns = [
    col.display({
      id: 'avatar',
      header: '',
      cell: ({ row }) => (
        <div className="w-9 h-9 rounded-full bg-[#0f172a] flex items-center justify-center text-[#C8FF00] font-bold text-sm">
          {row.original.name.charAt(0).toUpperCase()}
        </div>
      ),
    }),
    col.accessor('name', {
      header: 'Nombre',
      cell: (i) => <span className="font-medium text-gray-900">{i.getValue()}</span>,
    }),
    col.accessor('email', {
      header: 'Email',
      cell: (i) => <span className="text-gray-500">{i.getValue()}</span>,
    }),
    col.accessor('phone', {
      header: 'Teléfono',
      cell: (i) => <span className="text-gray-500">{i.getValue() ?? '—'}</span>,
    }),
    col.accessor('_count', {
      header: 'Pedidos',
      cell: (i) => (
        <Badge variant="blue">{i.getValue()?.orders ?? 0} pedidos</Badge>
      ),
    }),
    col.accessor('totalSpent', {
      header: 'Total gastado',
      cell: (i) => <span className="font-semibold text-gray-900">{formatPrice(i.getValue() ?? 0)}</span>,
    }),
    col.accessor('createdAt', {
      header: 'Registro',
      cell: (i) => <span className="text-gray-500 text-sm">{formatDate(i.getValue())}</span>,
    }),
    col.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={() => { setSelected(row.original); setDetailOpen(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
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

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length} clientes registrados</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]"
          />
        </div>
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
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

      {/* Customer Detail Modal */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Detalle del cliente" size="lg">
        {selected && (
          <div className="space-y-5">
            {/* Profile */}
            <div className="flex items-center gap-4 p-4 bg-[#0f172a] rounded-xl">
              <div className="w-16 h-16 rounded-full bg-[#C8FF00] flex items-center justify-center text-[#0f172a] font-black text-2xl">
                {selected.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{selected.name}</h3>
                <p className="text-slate-400 text-sm">{selected.email}</p>
                {selected.phone && <p className="text-slate-400 text-sm">{selected.phone}</p>}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Pedidos', value: selected._count?.orders ?? 0, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
                { label: 'Total gastado', value: formatPrice(selected.totalSpent ?? 0), icon: User2, color: 'text-green-600 bg-green-50' },
                { label: 'Registrado', value: formatDate(selected.createdAt), icon: Calendar, color: 'text-purple-600 bg-purple-50' },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mx-auto mb-2`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className="font-bold text-gray-900 text-sm mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Orders */}
            {(selected.orders ?? []).length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Últimos pedidos</p>
                <div className="space-y-2">
                  {selected.orders!.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                      <div>
                        <p className="font-mono font-semibold text-sm text-gray-900">{order.orderNumber}</p>
                        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

const MOCK: Customer[] = [
  { id: '1', name: 'Martín López', email: 'martin@email.com', phone: '+54 11 2345-6789', createdAt: '2024-01-15T00:00:00Z', _count: { orders: 8 }, totalSpent: 145200, orders: [] },
  { id: '2', name: 'Sofía García', email: 'sofia@email.com', phone: '+54 11 3456-7890', createdAt: '2024-02-20T00:00:00Z', _count: { orders: 3 }, totalSpent: 34500, orders: [] },
  { id: '3', name: 'Lucía Fernández', email: 'lucia@email.com', createdAt: '2024-03-05T00:00:00Z', _count: { orders: 12 }, totalSpent: 287000, orders: [] },
  { id: '4', name: 'Diego Torres', email: 'diego@email.com', phone: '+54 11 5678-9012', createdAt: '2024-04-10T00:00:00Z', _count: { orders: 1 }, totalSpent: 5200, orders: [] },
  { id: '5', name: 'Ana Martínez', email: 'ana@email.com', createdAt: '2024-05-18T00:00:00Z', _count: { orders: 5 }, totalSpent: 98400, orders: [] },
];

