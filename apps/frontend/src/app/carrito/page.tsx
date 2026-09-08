'use client';

import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useShippingRates } from '@/hooks/useShippingRates';
import { validateCoupon } from '@/lib/api';
import CarritoItemRow from './CarritoItemRow';
import CarritoSummary from './CarritoSummary';
import CarritoEmpty from './CarritoEmpty';

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice, couponCode, setCoupon } = useCartStore();
  const [couponInput, setCouponInput] = useState(couponCode ?? '');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const { flatRate, freeShippingThreshold } = useShippingRates();

  const subtotal = totalPrice();
  // Estimación para mostrar en pantalla — el monto que se cobra de verdad lo
  // recalcula el servidor al crear la orden (P1), esto nunca es la fuente de
  // verdad.
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : flatRate;
  const total = subtotal - discount + shippingCost;

  // Si ya había un cupón aplicado (por ejemplo, volviendo del checkout), se
  // vuelve a validar contra el subtotal actual — pudo cambiar el carrito.
  useEffect(() => {
    if (couponCode && subtotal > 0) {
      validateCoupon(couponCode, subtotal)
        .then((data) => setDiscount(data.discountAmount ?? 0))
        .catch(() => { setCoupon(null); setDiscount(0); });
    }
  }, [couponCode, subtotal, setCoupon]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const data = await validateCoupon(couponInput.trim(), subtotal);
      setCoupon(data.code);
      setDiscount(data.discountAmount ?? 0);
    } catch (err: any) {
      setCoupon(null);
      setDiscount(0);
      setCouponError(err?.response?.data?.message || 'Cupón inválido o vencido');
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return <CarritoEmpty />;
  }

  return (
    <div className="min-h-screen bg-[#050606]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#F7F6F7]">
            Mi carrito ({totalItems()} {totalItems() === 1 ? 'producto' : 'productos'})
          </h1>
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-400 transition-colors flex items-center gap-1">
            <X size={14} /> Vaciar carrito
          </button>
        </div>

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
            couponInput={couponInput}
            onCouponInputChange={setCouponInput}
            onApplyCoupon={handleApplyCoupon}
            couponLoading={couponLoading}
            couponError={couponError}
            couponCode={couponCode}
            discount={discount}
            subtotal={subtotal}
            shippingCost={shippingCost}
            freeShippingThreshold={freeShippingThreshold}
            total={total}
          />
        </div>
      </div>
    </div>
  );
}
