import { Mail, Phone } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { TrackedOrder } from './types';

export default function RastrearOrderCard({ order }: { order: TrackedOrder }) {
  return (
    <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <div><p className="text-xs text-[#8A8A85] uppercase tracking-wide">Pedido</p><p className="text-xl font-black text-[#B7D31A]">{order.number}</p></div>
        <div className="text-right"><p className="text-xs text-[#8A8A85] uppercase tracking-wide">Fecha</p><p className="text-sm font-semibold text-[#F7F6F7]">{new Date(order.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-[#0D0F0F]">
        <div><p className="text-xs text-[#8A8A85] uppercase tracking-wide">Productos</p><p className="text-sm font-semibold text-[#F7F6F7]">{order.items.map((item, i) => (
          <span key={i} className="text-sm font-semibold text-[#F7F6F7]">
            {item.product.name}
            {item.variant && <span className="text-[#8A8A85] font-normal"> ({item.variant.size}{item.variant.color ? ' / ' + item.variant.color : ''}{item.variant.dimensions ? ' / ' + item.variant.dimensions : ''}{item.variant.weight != null ? ' / ' + item.variant.weight + ' ' + (item.variant.weightUnit || '') : ''})</span>}
            <span className="text-[#8A8A85] font-normal"> x {item.quantity}</span>
            {i < order.items.length - 1 ? ", " : ""}
          </span>
        ))}</p></div>
        <div className="text-right"><p className="text-xs text-[#8A8A85] uppercase tracking-wide">Total</p><p className="text-lg font-black text-[#F7F6F7]">{formatPrice(order.total)}</p></div>
      </div>
      {(order.buyerEmail || order.buyerPhone) && (
        <div className="flex items-center gap-4 pt-4 border-t border-[#0D0F0F] text-xs text-[#8A8A85]">
          {order.buyerEmail && <span className="flex items-center gap-1"><Mail size={12} /> {order.buyerEmail}</span>}
          {order.buyerPhone && <span className="flex items-center gap-1"><Phone size={12} /> {order.buyerPhone}</span>}
        </div>
      )}
    </div>
  );
}
