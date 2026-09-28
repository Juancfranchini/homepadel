'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '@/types';
import { formatPrice, getImageUrl } from '@/lib/utils';

interface Props {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

const botonCantidad =
  'w-6 h-6 flex items-center justify-center rounded-md border border-line text-fg-soft ' +
  'transition-colors hover:border-[#B7D31A] hover:text-brand-fg disabled:opacity-40 ' +
  'disabled:hover:border-line disabled:hover:text-fg-soft disabled:cursor-not-allowed';

/**
 * Línea del resumen del pedido, editable.
 *
 * Hasta ahora el resumen era solo de lectura: para sacar o agregar algo había
 * que volver al carrito y rehacer el formulario entero. Los botones son de
 * tipo `button` a propósito — dentro de un <form>, el default es `submit` y
 * tocar "+" mandaba el pedido.
 */
export default function CheckoutSummaryItem({ item, onQuantityChange, onRemove }: Props) {
  const { product, quantity } = item;
  const stockMaximo = item.variantId
    ? product.variants?.find((v) => v.id === item.variantId)?.stock
    : product.stock;
  const puedeSumar = typeof stockMaximo !== 'number' || quantity < stockMaximo;

  return (
    <div className="flex gap-3 items-center">
      <div className="w-12 h-12 rounded-lg bg-chip flex-none overflow-hidden">
        {product.images[0]
          ? <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-xs font-black text-fg-muted">{product.name.slice(0, 2).toUpperCase()}</div>}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-fg-soft truncate">{product.name}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <button type="button" className={botonCantidad} onClick={() => onQuantityChange(quantity - 1)}
            aria-label={'Quitar una unidad de ' + product.name}>
            <Minus size={12} />
          </button>
          <span className="text-xs font-bold text-fg w-5 text-center" aria-live="polite">{quantity}</span>
          <button type="button" className={botonCantidad} disabled={!puedeSumar}
            onClick={() => onQuantityChange(quantity + 1)}
            aria-label={'Agregar una unidad de ' + product.name}>
            <Plus size={12} />
          </button>
          <button type="button" onClick={onRemove}
            className="ml-1 text-fg-muted transition-colors hover:text-red-500 light:hover:text-red-600"
            aria-label={'Quitar ' + product.name + ' del pedido'}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <p className="text-xs font-bold text-fg flex-none">{formatPrice(product.effectivePrice * quantity)}</p>
    </div>
  );
}
