'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useShippingRates } from '@/hooks/useShippingRates';
import { validateCoupon } from '@/lib/api';
import { useCheckoutSubmit } from './useCheckoutSubmit';
import CheckoutEmptyCart from './CheckoutEmptyCart';
import CheckoutSuccessScreen from './CheckoutSuccessScreen';
import CheckoutPersonalDataFields from './CheckoutPersonalDataFields';
import CheckoutShippingFields from './CheckoutShippingFields';
import CheckoutPaymentMethodFields from './CheckoutPaymentMethodFields';
import CheckoutOrderSummary from './CheckoutOrderSummary';

const checkoutSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Email invalido'),
  phone: z.string().min(8, 'Teléfono invalido').regex(/^[0-9+\s()-]+$/, 'Teléfono invalido'),
  street: z.string().min(5, 'La dirección es requerida'),
  city: z.string().min(2, 'La ciudad es requerida'),
  province: z.string().min(2, 'La provincia es requerida'),
  postalCode: z.string().min(4, 'El código postal es requerido').max(8, 'Código postal invalido'),
  paymentMethod: z.enum(['card', 'mercadopago', 'transfer'], { required_error: 'Selecciona un metodo de pago' }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, couponCode, setCoupon } = useCartStore();
  const { user } = useAuthStore();
  const { mercadopago, visa, mastercard, amex } = usePaymentMethods();
  const { flatRate, freeShippingThreshold } = useShippingRates();
  const [discount, setDiscount] = useState(0);
  const { onSubmit, orderSuccess, orderNumber, orderError } = useCheckoutSubmit({ items, couponCode, clearCart });

  const subtotal = totalPrice();
  // Estimación para mostrar en pantalla — el servidor recalcula envío y
  // descuento al crear la orden o la preferencia de pago (P1/P2); esto nunca
  // es lo que se cobra de verdad.
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : flatRate;
  const total = subtotal + shippingCost - discount;

  useEffect(() => {
    if (couponCode && subtotal > 0) {
      validateCoupon(couponCode, subtotal)
        .then((data) => setDiscount(data.discountAmount ?? 0))
        .catch(() => { setCoupon(null); setDiscount(0); });
    }
  }, [couponCode, subtotal, setCoupon]);

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '', paymentMethod: 'card' },
  });

  const selectedPayment = watch('paymentMethod');

  if (items.length === 0 && !orderSuccess) {
    return <CheckoutEmptyCart />;
  }

  if (orderSuccess) {
    return <CheckoutSuccessScreen orderNumber={orderNumber} />;
  }

  return (
    <div className="min-h-screen bg-[#050606]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <p className="text-xs text-[#8A8A85] mb-1">
            <Link href="/" className="hover:text-[#F7F6F7]">Inicio</Link> / <Link href="/carrito" className="hover:text-[#F7F6F7]">Carrito</Link> / <span className="text-[#C7C7C0]">Checkout</span>
          </p>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#F7F6F7]">Completar compra</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <CheckoutPersonalDataFields register={register} errors={errors} />
              <CheckoutShippingFields register={register} errors={errors} />
              <CheckoutPaymentMethodFields
                register={register}
                errors={errors}
                selectedPayment={selectedPayment}
                visa={visa}
                mastercard={mastercard}
                amex={amex}
                mercadopago={mercadopago}
              />
            </div>

            <CheckoutOrderSummary
              items={items}
              subtotal={subtotal}
              discount={discount}
              couponCode={couponCode}
              shippingCost={shippingCost}
              total={total}
              orderError={orderError}
              isSubmitting={isSubmitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
