import { X, Minus, Plus } from 'lucide-react';
import { CartItem } from '@/types';
import { getItemKey } from '@/store/cartStore';
import { formatPrice, getImageUrl } from '@/lib/utils';

interface Props {
  item: CartItem;
  onRemove: (itemKey: string) => void;
  onUpdateQuantity: (itemKey: string, quantity: number) => void;
}

export default function CartDrawerItem({ item, onRemove, onUpdateQuantity }: Props) {
  const { product, quantity, variantSize, variantColor, variantDimensions, variantWeight, variantWeightUnit, variantSku, variantImageUrl } = item;
  const itemPrice = product.effectivePrice;
  const itemSubtotal = itemPrice * quantity;
  const imageToShow = variantImageUrl || product.images?.[0];
  const itemKey = getItemKey(item);
  const itemStock = item.variantId
    ? product.variants?.find((variant) => variant.id === item.variantId)?.stock ?? 0
    : product.stock;

  return (
    <div className="flex gap-3 bg-[#0C0C0C] rounded-xl p-3 border border-[#0D0F0F]">
      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-[#1A1F21]">
        {imageToShow ? (
          <img src={getImageUrl(imageToShow)} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#8A8A85]">
            {product.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-[#8A8A85] uppercase mb-0.5">{product.brand?.name}</p>
            <p className="text-sm font-semibold text-[#F7F6F7] truncate">{product.name}</p>
            {(variantSize || variantColor || variantDimensions) && (
              <p className="text-[10px] text-[#8A8A85] mt-0.5">
                {variantSize && 'Talle: ' + variantSize}
                {variantSize && variantColor && ' | '}
                {variantColor && 'Color: ' + variantColor}
                {variantDimensions && (variantSize || variantColor ? ' | ' : '') + 'Dimensiones: ' + variantDimensions}
                {variantWeight && ' | Peso: ' + variantWeight + ' ' + (variantWeightUnit || '')}
              </p>
            )}
            {variantSku && <p className="text-[9px] text-[#8A8A85] mt-0.5">SKU: {variantSku}</p>}
          </div>
          <button onClick={() => onRemove(itemKey)} className="text-[#8A8A85] hover:text-red-500 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-[#1A1F21] rounded-lg overflow-hidden">
            <button onClick={() => onUpdateQuantity(itemKey, quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-[#1A1F21] transition-colors text-[#C7C7C0]">
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-7 text-center text-xs font-bold text-[#F7F6F7]">{quantity}</span>
            <button onClick={() => onUpdateQuantity(itemKey, quantity + 1)} disabled={quantity >= itemStock} className="w-7 h-7 flex items-center justify-center hover:bg-[#1A1F21] transition-colors disabled:opacity-40 text-[#C7C7C0]">
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <span className="text-sm font-bold text-[#B7D31A]">{formatPrice(itemSubtotal)}</span>
        </div>
      </div>
    </div>
  );
}
