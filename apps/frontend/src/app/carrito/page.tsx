'use client';

import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useShippingRates } from '@/hooks/useShippingRates';
import { useCoupon } from '@/hooks/useCoupon';
import CarritoItemRow from './CarritoItemRow';
import CarritoSummary from './CarritoSummary';
import CarritoEmpty from './CarritoEmpty';
import AuthModal from '@/components/auth/AuthModal';
import { useCheckoutNavigation } from '@/components/auth/useCheckoutNavigation';

function CartTitle({ count, onClear }: { count: number; onClear: () => void }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-2xl font-black uppercase tracking-tight text-[#F7F6F7]">Mi carrito ({count} {count === 1 ? 'producto' : 'productos'})</h1>
      <button onClick={onClear} className="text-sm text-red-500 hover:text-red-400 transition-colors flex items-center gap-1"><X size={14} /> Vaciar carrito</button>
    </div>
  );
}

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCartStore();
  const { flatRate, freeShippingThreshold } = useShippingRates();
  const checkoutNavigation = useCheckoutNavigation();

  const subtotal = totalPrice();
  const coupon = useCoupon(subtotal);
  // Estimación para mostrar en pantalla — el monto que se cobra de verdad lo
  // recalcula el servidor al crear la orden (P1), esto nunca es la fuente de
  // verdad.
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : flatRate;
  const total = subtotal - coupon.discount + shippingCost;

  if (items.length === 0) {
    return <CarritoEmpty />;
  }

  return (
    <div className="min-h-screen bg-[#050606]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <CartTitle count={totalItems()} onClear={clearCart} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <CarritoItemRow key={item.product.id + '-' + (item.variantSku || '')} item={item} onRemove={removeItem} onUpdateQuantity={updateQuantity} />
            ))}

            <Link href="/catalogo" className="flex items-center gap-2 text-sm font-semibold text-[#8A8A85] hover:text-[#F7F6F7] transition-colors pt-2">
              <ArrowRight size={14} className="rotate-180" /> Seguir comprando
            </Link>
          </div>

          <CarritoSummary
            coupon={coupon}
            subtotal={subtotal}
            shippingCost={shippingCost}
            freeShippingThreshold={freeShippingThreshold}
            total={total}
            onCheckout={checkoutNavigation.handleCheckout}
          />
        </div>
      </div>
      <AuthModal
        isOpen={checkoutNavigation.authOpen}
        returnTo="/checkout"
        onClose={checkoutNavigation.closeAuth}
        onAuthenticated={checkoutNavigation.handleAuthenticated}
      />
    </div>
  );
}
