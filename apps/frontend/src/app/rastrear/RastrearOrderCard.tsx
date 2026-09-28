import { Mail, Phone } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { TrackedOrder } from './types';

export default function RastrearOrderCard({ order }: { order: TrackedOrder }) {
  return (
    <div className="bg-card rounded-2xl border border-[#B7D31A]/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <div><p className="text-xs text-fg-muted uppercase tracking-wide">Pedido</p><p className="text-xl font-black text-brand-fg">{order.number}</p></div>
        <div className="text-right"><p className="text-xs text-fg-muted uppercase tracking-wide">Fecha</p><p className="text-sm font-semibold text-fg">{new Date(order.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-line">
        <div><p className="text-xs text-fg-muted uppercase tracking-wide">Productos</p><p className="text-sm font-semibold text-fg">{order.items.map((item, i) => (
          <span key={i} className="text-sm font-semibold text-fg">
            {item.product.name}
            {item.variant && <span className="text-fg-muted font-normal"> ({item.variant.size}{item.variant.color ? ' / ' + item.variant.color : ''}{item.variant.dimensions ? ' / ' + item.variant.dimensions : ''}{item.variant.weight != null ? ' / ' + item.variant.weight + ' ' + (item.variant.weightUnit || '') : ''})</span>}
            <span className="text-fg-muted font-normal"> x {item.quantity}</span>
            {i < order.items.length - 1 ? ", " : ""}
          </span>
        ))}</p></div>
        <div className="text-right"><p className="text-xs text-fg-muted uppercase tracking-wide">Total</p><p className="text-lg font-black text-fg">{formatPrice(order.total)}</p></div>
      </div>
      {(order.buyerEmail || order.buyerPhone) && (
        <div className="flex items-center gap-4 pt-4 border-t border-line text-xs text-fg-muted">
          {order.buyerEmail && <span className="flex items-center gap-1"><Mail size={12} /> {order.buyerEmail}</span>}
          {order.buyerPhone && <span className="flex items-center gap-1"><Phone size={12} /> {order.buyerPhone}</span>}
        </div>
      )}
    </div>
  );
}
