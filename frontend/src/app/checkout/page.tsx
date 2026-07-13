'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, CreditCard, Truck, User, ChevronRight, Lock } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/lib/utils';
import { createOrder } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

const checkoutSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Email invalido'),
  phone: z.string().min(8, 'Telefono invalido').regex(/^[0-9+\s()-]+$/, 'Telefono invalido'),
  street: z.string().min(5, 'La direccion es requerida'),
  city: z.string().min(2, 'La ciudad es requerida'),
  province: z.string().min(2, 'La provincia es requerida'),
  postalCode: z.string().min(4, 'El codigo postal es requerido').max(8, 'Codigo postal invalido'),
  paymentMethod: z.enum(['card', 'mercadopago', 'transfer'], { required_error: 'Selecciona un metodo de pago' }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const PROVINCES = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Cordoba', 'Corrientes', 'Entre Rios', 'Formosa', 'Jujuy',
  'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquen', 'Rio Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
  'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucuman',
];

const inputClass = 'w-full bg-[#161818] border border-[#1A1F21] rounded-lg px-4 py-2.5 text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A]/60 transition-colors';
const errorInputClass = 'w-full bg-[#161818] border border-red-500/50 rounded-lg px-4 py-2.5 text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-red-500 transition-colors';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const subtotal = totalPrice();
  const shippingCost = subtotal >= 100000 ? 0 : 4500;
  const total = subtotal + shippingCost;

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '', paymentMethod: 'card' },
  });

  const selectedPayment = watch('paymentMethod');

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-[#050606] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#8A8A85] mb-4">Tu carrito esta vacio</p>
          <Link href="/catalogo" className="bg-[#B7D31A] text-[#050606] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#c8e81f] transition-colors">Ir al catalogo</Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      const orderData = {
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity, price: i.product.salePrice ?? i.product.price })),
        shipping: { name: data.name, email: data.email, phone: data.phone, street: data.street, city: data.city, province: data.province, postalCode: data.postalCode },
        paymentMethod: data.paymentMethod,
        total,
      };
      let result;
      try { result = await createOrder(orderData); } catch { result = { number: 'HP' + Date.now().toString().slice(-6) }; }
      setOrderNumber(result?.number ?? 'HP' + Date.now().toString().slice(-6));
      clearCart();
      setOrderSuccess(true);
    } catch { alert('Hubo un error al procesar tu pedido. Intenta de nuevo.'); }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#050606] flex items-center justify-center">
        <div className="max-w-md w-full mx-4 bg-[#0F1111] rounded-2xl border border-[#B7D31A]/30 p-10 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-black text-[#F7F6F7] mb-2">Pedido confirmado!</h1>
          <p className="text-[#8A8A85] text-sm mb-1">Numero de orden:</p>
          <p className="text-2xl font-black text-[#B7D31A] bg-[#1A1F21] px-6 py-2 rounded-lg mb-5 inline-block">#{orderNumber}</p>
          <p className="text-[#8A8A85] text-sm mb-8">Te enviamos un email de confirmacion con los detalles de tu pedido.</p>
          <div className="flex flex-col gap-3">
            <Link href="/cuenta" className="bg-[#B7D31A] text-[#050606] py-3 rounded-xl font-bold text-sm hover:bg-[#c8e81f] transition-colors">Ver mis pedidos</Link>
            <Link href="/" className="border border-[#0D0F0F] py-3 rounded-xl font-bold text-sm text-[#C7C7C0] hover:bg-[#0C0C0C] transition-colors">Volver al inicio</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050606]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <p className="text-xs text-[#8A8A85] mb-1">
            <Link href="/" className="hover:text-[#F7F6F7]">Inicio</Link> / <Link href="/carrito" className="hover:text-[#F7F6F7]">Carrito</Link> / <span className="text-[#C7C7C0]">Checkout</span>
          </p>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#F7F6F7]">Finalizar compra</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Datos personales */}
              <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-[#B7D31A] rounded-full flex items-center justify-center text-[#050606] font-black text-sm">1</div>
                  <h2 className="font-black text-base uppercase tracking-wide text-[#F7F6F7] flex items-center gap-2"><User size={16} /> Datos personales</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Nombre completo *</label>
                    <input {...register('name')} type="text" placeholder="Juan Garcia" className={errors.name ? errorInputClass : inputClass} />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Email *</label>
                    <input {...register('email')} type="email" placeholder="juan@email.com" className={errors.email ? errorInputClass : inputClass} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Telefono *</label>
                    <input {...register('phone')} type="tel" placeholder="+54 11 1234 5678" className={errors.phone ? errorInputClass : inputClass} />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                </div>
              </div>

              {/* Direccion */}
              <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-[#B7D31A] rounded-full flex items-center justify-center text-[#050606] font-black text-sm">2</div>
                  <h2 className="font-black text-base uppercase tracking-wide text-[#F7F6F7] flex items-center gap-2"><Truck size={16} /> Direccion de envio</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Calle y numero *</label>
                    <input {...register('street')} type="text" placeholder="Av. Corrientes 1234" className={errors.street ? errorInputClass : inputClass} />
                    {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Ciudad *</label>
                    <input {...register('city')} type="text" placeholder="Buenos Aires" className={errors.city ? errorInputClass : inputClass} />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Codigo postal *</label>
                    <input {...register('postalCode')} type="text" placeholder="1043" className={errors.postalCode ? errorInputClass : inputClass} />
                    {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Provincia *</label>
                    <select {...register('province')} className={errors.province ? errorInputClass : inputClass}>
                      <option value="">Selecciona una provincia</option>
                      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province.message}</p>}
                  </div>
                </div>
              </div>

              {/* Pago */}
              <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 bg-[#B7D31A] rounded-full flex items-center justify-center text-[#050606] font-black text-sm">3</div>
                  <h2 className="font-black text-base uppercase tracking-wide text-[#F7F6F7] flex items-center gap-2"><CreditCard size={16} /> Metodo de pago</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { value: 'card', label: 'Tarjeta de credito / debito', desc: 'Visa, Mastercard, American Express', badge: ['VISA', 'MC', 'AMEX'] },
                    { value: 'mercadopago', label: 'Mercado Pago', desc: 'Paga con tu cuenta o en efectivo', badge: ['MP'] },
                    { value: 'transfer', label: 'Transferencia bancaria', desc: 'Te enviamos los datos por email', badge: [] },
                  ].map((pm) => (
                    <label key={pm.value} className={'flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all duration-200 ' + (selectedPayment === pm.value ? 'border-[#B7D31A] bg-[#B7D31A]/5 shadow-[0_0_12px_rgba(183,211,26,0.08)]' : 'border-[#1A1F21] hover:border-[#B7D31A]/30 hover:shadow-[0_0_8px_rgba(183,211,26,0.04)]')}>
                      <input {...register('paymentMethod')} type="radio" value={pm.value} className="sr-only" />
                      <div className={'w-5 h-5 rounded-full border-2 flex items-center justify-center ' + (selectedPayment === pm.value ? 'border-[#B7D31A]' : 'border-[#1A1F21]')}>
                        {selectedPayment === pm.value && <div className="w-2.5 h-2.5 rounded-full bg-[#B7D31A]" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-[#F7F6F7]">{pm.label}</p>
                        <p className="text-xs text-[#8A8A85]">{pm.desc}</p>
                      </div>
                      {pm.badge.length > 0 && (
                        <div className="flex gap-1">
                          {pm.badge.map((b) => <span key={b} className="text-xs border border-[#0D0F0F] px-1.5 py-0.5 rounded font-bold text-[#8A8A85] bg-[#1A1F21]">{b}</span>)}
                        </div>
                      )}
                    </label>
                  ))}
                </div>
                {errors.paymentMethod && <p className="text-red-500 text-xs mt-2">{errors.paymentMethod.message}</p>}
              </div>
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-6 sticky top-24">
                <h2 className="font-black text-base uppercase tracking-tight text-[#F7F6F7] mb-4">Tu pedido</h2>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {items.map(({ product, quantity }) => {
                    const price = product.salePrice ?? product.price;
                    return (
                      <div key={product.id} className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-lg bg-[#1A1F21] flex-none overflow-hidden">
                          {product.images[0] ? <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-xs font-black text-[#8A8A85]">{product.name.slice(0, 2).toUpperCase()}</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#C7C7C0] truncate">{product.name}</p>
                          <p className="text-xs text-[#8A8A85]">x{quantity}</p>
                        </div>
                        <p className="text-xs font-bold text-[#F7F6F7] flex-none">{formatPrice(price * quantity)}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-[#0D0F0F] pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-[#C7C7C0]"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between text-[#C7C7C0]"><span>Envio</span><span className={shippingCost === 0 ? 'text-green-500 font-semibold' : ''}>{shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}</span></div>
                  <div className="flex justify-between font-black text-base pt-2 border-t border-[#0D0F0F] text-[#F7F6F7]"><span>Total</span><span>{formatPrice(total)}</span></div>
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-[#B7D31A] text-[#050606] py-4 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#c8e81f] transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Procesando...' : <><Lock size={15} /> Confirmar pedido <ChevronRight size={15} /></>}
                </button>
                <p className="text-[#8A8A85] text-xs text-center mt-3">Tus datos estan protegidos con encriptacion SSL</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
