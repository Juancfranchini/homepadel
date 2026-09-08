'use client';

import { useEffect } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import CartDrawerItem from './CartDrawerItem';
import CartDrawerFooter from './CartDrawerFooter';

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
              {items.map((item) => (
                <CartDrawerItem
                  key={item.product.id + '-' + (item.variantSku || '')}
                  item={item}
                  onRemove={removeItem}
                  onUpdateQuantity={updateQuantity}
                />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && <CartDrawerFooter subtotal={subtotal} onClose={onClose} />}
      </div>
    </div>
  );
}