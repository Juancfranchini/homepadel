import Link from 'next/link';
import { Package, CheckCircle, ChevronRight } from 'lucide-react';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';

const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-amber-500/20 text-amber-400 light:text-amber-700' },
  PAID: { label: 'Pagado', color: 'bg-blue-500/20 text-blue-400 light:text-blue-700' },
  SHIPPED: { label: 'Enviado', color: 'bg-purple-500/20 text-purple-400 light:text-purple-700' },
  DELIVERED: { label: 'Entregado', color: 'bg-green-500/20 text-green-400 light:text-green-700' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400 light:text-red-700' },
};

interface Props {
  orders: Order[];
  loading: boolean;
}

export default function CuentaOrdersTab({ orders, loading }: Props) {
  return (
    <div>
      {/* Sin botón de rastreo: la página de seguimiento está fuera de uso
          hasta que haya credenciales del correo. El estado de cada pedido ya
          se ve en su propia fila, que era lo único que informaba. */}
      <div className="mb-5">
        <h2 className="font-black text-lg uppercase tracking-tight text-fg flex items-center gap-2"><Package size={20} className="text-brand-fg" />Mis pedidos</h2>
      </div>
      {loading ? (
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-16 bg-chip rounded-lg animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-chip mb-4" />
          <p className="text-fg-muted font-medium mb-1">Todavia no realizaste pedidos</p>
          <p className="text-fg-muted text-sm mb-5">Explora nuestro catálogo y hace tu primer pedido</p>
          <Link href="/catalogo" className="inline-flex items-center gap-2 bg-[#B7D31A] text-[#050606] px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#c8e81f] transition-colors">Ver catálogo <ChevronRight size={14} /></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = ORDER_STATUS_MAP[order.status] ?? { label: order.status, color: 'bg-chip text-fg-muted' };
            return (
              <div key={order.id}
                className="flex items-center justify-between p-4 border border-chip rounded-xl">
                <div className="flex items-center gap-3">
                  {order.status === 'DELIVERED' ? <CheckCircle size={18} className="text-green-500 light:text-green-700" /> : <Package size={18} className="text-fg-muted" />}
                  <div>
                    <p className="font-bold text-sm text-fg">Pedido #{order.number}</p>
                    <p className="text-xs text-fg-muted">{new Date(order.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={'text-xs font-bold px-2.5 py-1 rounded-full ' + status.color}>{status.label}</span>
                  <span className="font-black text-sm text-fg">{formatPrice(order.total)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
