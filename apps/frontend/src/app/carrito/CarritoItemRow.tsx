'use client';

import Link from 'next/link';
import { Minus, Plus, X } from 'lucide-react';
import { CartItem } from '@/types';
import { getItemKey } from '@/store/cartStore';
import { formatPrice, getImageUrl } from '@/lib/utils';

interface Props {
  item: CartItem;
  onRemove: (itemKey: string) => void;
  onUpdateQuantity: (itemKey: string, quantity: number) => void;
}

export default function CarritoItemRow({ item, onRemove, onUpdateQuantity }: Props) {
  const { product, quantity, variantSize, variantColor, variantDimensions, variantWeight, variantWeightUnit, variantSku, variantImageUrl } = item;
  const itemPrice = product.salePrice ?? product.price;
  const subtotalItem = itemPrice * quantity;
  const itemKey = getItemKey(item);
  const itemStock = item.variantId
    ? product.variants?.find((variant) => variant.id === item.variantId)?.stock ?? 0
    : product.stock;

  return (
    <div className="bg-[#0F1111] rounded-xl border border-[#B7D31A]/20 p-4 flex gap-4 hover:border-[#B7D31A]/50 hover:shadow-[0_0_12px_rgba(183,211,26,0.08)] transition-all duration-300">
      <div className="w-20 h-20 md:w-24 md:h-24 flex-none rounded-lg overflow-hidden bg-[#1A1F21]">
        {variantImageUrl || product.images[0] ? (
          <img src={getImageUrl(variantImageUrl || product.images[0])} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl font-black text-[#8A8A85]">{product.name.slice(0, 2).toUpperCase()}</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-[#8A8A85] font-medium uppercase mb-0.5">{product.brand?.name}</p>
            <Link href={'/producto/' + product.slug} className="font-semibold text-sm text-[#F7F6F7] hover:text-[#B7D31A] line-clamp-2 leading-snug">{product.name}</Link>
          </div>
          <button onClick={() => onRemove(itemKey)} className="flex-none text-[#8A8A85] hover:text-red-500 transition-colors p-1" aria-label="Eliminar producto">
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-black text-[#F7F6F7]">{formatPrice(itemPrice)}</span>
          {product.salePrice && <span className="text-xs text-[#8A8A85] line-through">{formatPrice(product.price)}</span>}
        </div>
        {(variantSize || variantColor || variantDimensions) && (
          <p className="text-[10px] text-[#8A8A85] mt-1">
            {variantSize && 'Talle: ' + variantSize}
            {variantSize && variantColor && ' | '}
            {variantColor && 'Color: ' + variantColor}
            {variantDimensions && (variantSize || variantColor ? ' | ' : '') + 'Dimensiones: ' + variantDimensions}
            {variantWeight && ' | Peso: ' + variantWeight + ' ' + (variantWeightUnit || '')}
          </p>
        )}
        {variantSku && <p className="text-[9px] text-[#8A8A85] mt-0.5">SKU: {variantSku}</p>}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-[#1A1F21] rounded-lg overflow-hidden">
            <button onClick={() => onUpdateQuantity(itemKey, quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-[#1A1F21] transition-colors text-[#C7C7C0]"><Minus size={14} /></button>
            <span className="w-8 text-center text-sm font-bold text-[#F7F6F7]">{quantity}</span>
            <button onClick={() => onUpdateQuantity(itemKey, quantity + 1)} disabled={quantity >= itemStock} className="w-8 h-8 flex items-center justify-center hover:bg-[#1A1F21] transition-colors disabled:opacity-40 text-[#C7C7C0]"><Plus size={14} /></button>
          </div>
          <span className="font-black text-[#B7D31A] text-sm">{formatPrice(subtotalItem)}</span>
        </div>
      </div>
    </div>
  );
}
