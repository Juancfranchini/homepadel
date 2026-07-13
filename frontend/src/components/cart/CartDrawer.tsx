'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, getImageUrl } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: Props) {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotal = totalPrice();

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#050606] flex flex-col shadow-2xl animate-slide-in"
        style={{ borderLeft: '1px solid rgba(183, 211, 26, 0.15)', boxShadow: '-4px 0 20px rgba(183, 211, 26, 0.06)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#0D0F0F]">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#B7D31A]" />
            <h2 className="text-lg font-bold text-[#F7F6F7]">
              Mi carrito ({totalItems()})
            </h2>
          </div>
          <button onClick={onClose} className="text-[#8A8A85] hover:text-[#F7F6F7] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-[#1A1F21] mb-4" />
              <p className="text-[#8A8A85] text-sm mb-6">Tu carrito esta vacio</p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#B7D31A] text-[#050606] hover:bg-[#c8e81f] transition-colors"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(({ product, quantity }) => {
                const itemPrice = product.salePrice ?? product.price;
                const itemSubtotal = itemPrice * quantity;

                return (
                  <div key={product.id} className="flex gap-3 bg-[#0C0C0C] rounded-xl p-3 border border-[#0D0F0F]">
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-[#1A1F21]">
                      {product.images?.[0] ? (
                        <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
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
                        </div>
                        <button onClick={() => removeItem(product.id)} className="text-[#8A8A85] hover:text-red-500 transition-colors flex-shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-[#1A1F21] rounded-lg overflow-hidden">
                          <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-[#1A1F21] transition-colors text-[#C7C7C0]">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-[#F7F6F7]">{quantity}</span>
                          <button onClick={() => updateQuantity(product.id, quantity + 1)} disabled={quantity >= product.stock} className="w-7 h-7 flex items-center justify-center hover:bg-[#1A1F21] transition-colors disabled:opacity-40 text-[#C7C7C0]">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-[#B7D31A]">{formatPrice(itemSubtotal)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#0D0F0F] px-6 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#C7C7C0]">Subtotal</span>
              <span className="text-lg font-bold text-[#F7F6F7]">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-[10px] text-[#8A8A85] text-right">Envio calculado en el checkout</p>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/carrito"
                onClick={onClose}
                className="flex items-center justify-center gap-1 px-4 py-3 rounded-lg text-sm font-semibold border border-[#B7D31A]/30 text-[#F7F6F7] hover:border-[#B7D31A]/60 hover:bg-[#0C0C0C] transition-all"
              >
                Ver carrito
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="flex items-center justify-center gap-1 px-4 py-3 rounded-lg text-sm font-semibold bg-[#B7D31A] text-[#050606] hover:bg-[#c8e81f] transition-colors"
              >
                Finalizar compra
                <ShoppingBag className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
