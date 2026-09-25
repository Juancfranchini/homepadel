import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { PosCartItem } from './types';

interface Props {
  items: PosCartItem[];
  subtotal: number;
  onQuantity: (key: string, quantity: number) => void;
}

export function CartPanel({ items, subtotal, onQuantity }: Props) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-gray-500" />
          <h2 className="font-bold text-gray-900">Carrito</h2>
        </div>
        <span className="rounded-full bg-[#C8FF00] px-2.5 py-1 text-xs font-bold text-[#0f172a]">
          {items.reduce((sum, item) => sum + item.quantity, 0)}
        </span>
      </div>
      <div className="max-h-80 space-y-2 overflow-y-auto">
        {items.map((item) => (
          <div key={item.key} className="rounded-xl border border-gray-100 p-3">
            <div className="flex justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{item.product.name}</p>
                <p className="text-xs text-gray-400">
                  {item.variant
                    ? [item.variant.size, item.variant.color].filter(Boolean).join(' / ')
                    : item.product.sku}
                </p>
              </div>
              <p className="text-sm font-bold">
                {formatPrice(item.product.effectivePrice * item.quantity)}
              </p>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onQuantity(item.key, item.quantity - 1)}
                className="rounded-md border p-1"
              >
                {item.quantity === 1 ? (
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <Minus className="h-3.5 w-3.5" />
                )}
              </button>
              <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
              <button
                type="button"
                onClick={() => onQuantity(item.key, item.quantity + 1)}
                className="rounded-md border p-1"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
        {!items.length && (
          <p className="py-12 text-center text-sm text-gray-400">El carrito está vacío</p>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="font-semibold text-gray-600">Subtotal</span>
        <span className="text-xl font-black text-gray-900">{formatPrice(subtotal)}</span>
      </div>
    </section>
  );
}
