'use client';
// Página del carrito de compras
// Lista de items con controles de cantidad, resumen de orden, cupón de descuento
// Estado vacío con link al catálogo, botones para finalizar o seguir comprando

import Link from 'next/link';
import { Minus, Plus, X, ShoppingBag, Tag, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { getImageUrl } from '@/lib/utils';

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
      setCouponError('Cupón inválido o vencido');
      setCouponApplied(false);
    }
  };

  // ── Estado vacío ──────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#111] mb-8">
            Mi carrito
          </h1>
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <ShoppingBag size={56} className="mx-auto text-gray-200 mb-5" />
            <h2 className="text-xl font-bold text-gray-600 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-400 text-sm mb-8">
              Todavía no agregaste productos. ¡Explorá nuestro catálogo!
            </p>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 bg-[#C8FF00] text-[#111] px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#111] hover:text-white transition-colors duration-200"
            >
              Ver catálogo
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Título + vaciar */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#111]">
            Mi carrito ({totalItems()} {totalItems() === 1 ? 'producto' : 'productos'})
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
          >
            <X size={14} />
            Vaciar carrito
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Lista de productos ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ product, quantity }) => {
              const itemPrice = product.salePrice ?? product.price;
              const subtotalItem = itemPrice * quantity;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4"
                >
                  {/* Imagen */}
                  <div className="w-20 h-20 md:w-24 md:h-24 flex-none rounded-lg overflow-hidden bg-gray-100">
                    {product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getImageUrl(product.images[0])}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl font-black text-gray-300">
                        {product.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase mb-0.5">
                          {product.brand?.name}
                        </p>
                        <Link
                          href={`/producto/${product.slug}`}
                          className="font-semibold text-sm text-[#111] hover:text-[#444] line-clamp-2 leading-snug"
                        >
                          {product.name}
                        </Link>
                      </div>
                      {/* Botón eliminar */}
                      <button
                        onClick={() => removeItem(product.id)}
                        className="flex-none text-gray-300 hover:text-red-500 transition-colors p-1"
                        aria-label="Eliminar producto"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Precio unitario */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-black text-[#111]">
                        {formatPrice(itemPrice)}
                      </span>
                      {product.salePrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>

                    {/* Controles de cantidad + subtotal */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="font-black text-[#111] text-sm">
                        {formatPrice(subtotalItem)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Seguir comprando */}
            <Link
              href="/catalogo"
              className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#111] transition-colors pt-2"
            >
              ← Seguir comprando
            </Link>
          </div>

          {/* ── Resumen del pedido ─────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <h2 className="font-black text-lg uppercase tracking-tight mb-5">
                Resumen del pedido
              </h2>

              {/* Líneas de precio */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems()} productos)</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>

                {couponApplied && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag size={13} />
                      Descuento cupón (10%)
                    </span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className={`font-semibold ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                    {shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}
                  </span>
                </div>

                {shippingCost > 0 && (
                  <p className="text-xs text-gray-400">
                    Envío gratis en compras superiores a {formatPrice(shippingThreshold)}
                  </p>
                )}
              </div>

              {/* Cupón */}
              <div className="my-5 pt-5 border-t border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Código de descuento
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => {
                      setCoupon(e.target.value);
                      setCouponError('');
                    }}
                    placeholder="Ingresá tu cupón"
                    disabled={couponApplied}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <button
                    onClick={couponApplied ? () => { setCouponApplied(false); setCoupon(''); } : handleApplyCoupon}
                    disabled={!coupon && !couponApplied}
                    className="px-4 py-2 bg-[#111] text-white text-xs font-bold rounded-lg hover:bg-[#222] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {couponApplied ? 'Quitar' : 'Aplicar'}
                  </button>
                </div>
                {couponError && (
                  <p className="text-red-500 text-xs mt-1">{couponError}</p>
                )}
                {couponApplied && (
                  <p className="text-green-600 text-xs mt-1 font-semibold">
                    ¡Cupón aplicado! -10% de descuento
                  </p>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-end pt-4 border-t border-gray-200 mb-5">
                <span className="font-black text-base uppercase">Total</span>
                <div className="text-right">
                  <p className="text-2xl font-black text-[#111]">{formatPrice(total)}</p>
                  <p className="text-xs text-gray-400">IVA incluido</p>
                </div>
              </div>

              {/* Botón finalizar compra */}
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-[#C8FF00] text-[#111] py-4 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#111] hover:text-white transition-colors duration-200"
              >
                Finalizar compra
                <ArrowRight size={16} />
              </Link>

              {/* Métodos de pago */}
              <div className="mt-4 flex items-center justify-center gap-2">
                {['VISA', 'MC', 'AMEX', 'MP'].map((m) => (
                  <span
                    key={m}
                    className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded font-medium"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
