import Link from 'next/link';
import { Package, Truck, CheckCircle, ChevronRight } from 'lucide-react';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';

const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-amber-500/20 text-amber-400' },
  PAID: { label: 'Pagado', color: 'bg-blue-500/20 text-blue-400' },
  SHIPPED: { label: 'Enviado', color: 'bg-purple-500/20 text-purple-400' },
  DELIVERED: { label: 'Entregado', color: 'bg-green-500/20 text-green-400' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400' },
};

interface Props {
  orders: Order[];
  loading: boolean;
}

export default function CuentaOrdersTab({ orders, loading }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-black text-lg uppercase tracking-tight text-[#F7F6F7] flex items-center gap-2"><Package size={20} className="text-[#B7D31A]" />Mis pedidos</h2>
        <Link href="/rastrear" className="inline-flex items-center gap-2 text-sm text-[#B7D31A] hover:text-[#c8e81f] transition-colors border border-[#B7D31A]/30 rounded-xl px-4 py-2">
          <Truck size={16} /> Rastrear pedido
        </Link>
      </div>
      {loading ? (
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-16 bg-[#1A1F21] rounded-lg animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-[#1A1F21] mb-4" />
          <p className="text-[#8A8A85] font-medium mb-1">Todavia no realizaste pedidos</p>
          <p className="text-[#8A8A85] text-sm mb-5">Explora nuestro catálogo y hace tu primer pedido</p>
          <Link href="/catalogo" className="inline-flex items-center gap-2 bg-[#B7D31A] text-[#050606] px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#c8e81f] transition-colors">Ver catálogo <ChevronRight size={14} /></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = ORDER_STATUS_MAP[order.status] ?? { label: order.status, color: 'bg-[#1A1F21] text-[#8A8A85]' };
            return (
              <Link key={order.id} href={'/rastrear?order=' + order.number}
                className="flex items-center justify-between p-4 border border-[#1A1F21] rounded-xl hover:border-[#B7D31A]/30 hover:bg-[#0C0C0C] transition-all">
                <div className="flex items-center gap-3">
                  {order.status === 'DELIVERED' ? <CheckCircle size={18} className="text-green-500" /> : <Package size={18} className="text-[#8A8A85]" />}
                  <div>
                    <p className="font-bold text-sm text-[#F7F6F7]">Pedido #{order.number}</p>
                    <p className="text-xs text-[#8A8A85]">{new Date(order.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={'text-xs font-bold px-2.5 py-1 rounded-full ' + status.color}>{status.label}</span>
                  <span className="font-black text-sm text-[#F7F6F7]">{formatPrice(order.total)}</span>
                  <ChevronRight size={16} className="text-[#8A8A85]" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
