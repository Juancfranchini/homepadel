'use client';

import Link from 'next/link';
import { Minus, Plus, X, ShoppingBag, Tag, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, getImageUrl } from '@/lib/utils';

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCartStore();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const subtotal = totalPrice();
  const shippingThreshold = 100000;
  const shippingCost = subtotal >= shippingThreshold ? 0 : 4500;
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount + shippingCost;

  const handleApplyCoupon = () => {
    const VALID_COUPONS = ['HOMEPADEL10', 'PRIMERA10', 'DESCUENTO10'];
    if (VALID_COUPONS.includes(coupon.toUpperCase())) {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Cupon invalido o vencido');
      setCouponApplied(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#050606]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#F7F6F7] mb-8">Mi carrito</h1>
          <div className="bg-[#0C0C0C] rounded-2xl border border-[#B7D31A]/20 p-16 text-center">
            <ShoppingBag size={56} className="mx-auto text-[#1A1F21] mb-5" />
            <h2 className="text-xl font-bold text-[#8A8A85] mb-2">Tu carrito esta vacio</h2>
            <p className="text-[#8A8A85] text-sm mb-8">Todavia no agregaste productos. Explora nuestro catalogo!</p>
            <Link href="/catalogo" className="inline-flex items-center gap-2 bg-[#B7D31A] text-[#050606] px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#c8e81f] transition-colors">
              Ver catalogo <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
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
            {items.map(({ product, quantity }) => {
              const itemPrice = product.salePrice ?? product.price;
              const subtotalItem = itemPrice * quantity;

              return (
                <div key={product.id} className="bg-[#0F1111] rounded-xl border border-[#B7D31A]/20 p-4 flex gap-4 hover:border-[#B7D31A]/50 hover:shadow-[0_0_12px_rgba(183,211,26,0.08)] transition-all duration-300">
                  <div className="w-20 h-20 md:w-24 md:h-24 flex-none rounded-lg overflow-hidden bg-[#1A1F21]">
                    {product.images[0] ? (
                      <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
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
                      <button onClick={() => removeItem(product.id)} className="flex-none text-[#8A8A85] hover:text-red-500 transition-colors p-1" aria-label="Eliminar producto">
                        <X size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-black text-[#F7F6F7]">{formatPrice(itemPrice)}</span>
                      {product.salePrice && <span className="text-xs text-[#8A8A85] line-through">{formatPrice(product.price)}</span>}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#1A1F21] rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-[#1A1F21] transition-colors text-[#C7C7C0]"><Minus size={14} /></button>
                        <span className="w-8 text-center text-sm font-bold text-[#F7F6F7]">{quantity}</span>
                        <button onClick={() => updateQuantity(product.id, quantity + 1)} disabled={quantity >= product.stock} className="w-8 h-8 flex items-center justify-center hover:bg-[#1A1F21] transition-colors disabled:opacity-40 text-[#C7C7C0]"><Plus size={14} /></button>
                      </div>
                      <span className="font-black text-[#B7D31A] text-sm">{formatPrice(subtotalItem)}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            <Link href="/catalogo" className="flex items-center gap-2 text-sm font-semibold text-[#8A8A85] hover:text-[#F7F6F7] transition-colors pt-2">
              <ArrowRight size={14} className="rotate-180" /> Seguir comprando
            </Link>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-6 sticky top-24">
              <h2 className="font-black text-base uppercase tracking-tight text-[#F7F6F7] mb-4">Resumen</h2>

              <div className="mb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A85]" />
                    <input type="text" value={coupon} onChange={(e) => setCoupon(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#1A1F21] border border-[#0D0F0F] rounded-lg text-xs text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A]/50"
                      placeholder="Codigo de cupon" />
                  </div>
                  <button onClick={handleApplyCoupon} className="px-4 py-2 bg-[#B7D31A] text-[#050606] rounded-lg text-xs font-bold hover:bg-[#c8e81f] transition-colors">Aplicar</button>
                </div>
                {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                {couponApplied && <p className="text-green-500 text-xs mt-1">Cupon aplicado (10% OFF)</p>}
              </div>

              <div className="border-t border-[#0D0F0F] pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-[#C7C7C0]"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-500"><span>Descuento</span><span>-{formatPrice(discount)}</span></div>}
                <div className="flex justify-between text-[#C7C7C0]">
                  <span>Envio</span>
                  <span className={shippingCost === 0 ? 'text-green-500 font-semibold' : ''}>{shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between font-black text-base pt-2 border-t border-[#0D0F0F] text-[#F7F6F7]"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>

              <Link href="/checkout" className="mt-5 w-full flex items-center justify-center gap-2 bg-[#B7D31A] text-[#050606] py-4 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#c8e81f] transition-colors">
                Finalizar compra <ArrowRight size={15} />
              </Link>

              <p className="text-[#8A8A85] text-xs text-center mt-3">Envio gratis en compras superiores a {formatPrice(shippingThreshold)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
