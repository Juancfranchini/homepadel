import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Props {
  subtotal: number;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartDrawerFooter({ subtotal, onClose, onCheckout }: Props) {
  return (
    <div className="border-t border-line px-6 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-fg-soft">Subtotal</span>
        <span className="text-lg font-bold text-fg">{formatPrice(subtotal)}</span>
      </div>
      <p className="text-[10px] text-fg-muted text-right">Envío calculado en el checkout</p>

      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/carrito"
          onClick={onClose}
          className="flex items-center justify-center gap-1 px-4 py-3 rounded-lg text-sm font-semibold border border-[#B7D31A]/30 text-fg hover:border-[#B7D31A]/60 hover:bg-panel transition-all"
        >
          Ver carrito
          <ArrowRight className="w-4 h-4" />
        </Link>
        <button
          type="button"
          onClick={onCheckout}
          className="flex items-center justify-center gap-1 px-4 py-3 rounded-lg text-sm font-semibold bg-[#B7D31A] text-[#050606] hover:bg-[#c8e81f] transition-colors"
        >
          Finalizar compra
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
