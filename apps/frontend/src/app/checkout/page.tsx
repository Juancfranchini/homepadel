'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useShippingRates } from '@/hooks/useShippingRates';
import { validateCoupon } from '@/lib/api';
import { useInitiateCheckout } from './useInitiateCheckout';
import { useCheckoutSubmit } from './useCheckoutSubmit';
import { limpiarBorrador, useCheckoutDraft } from './useCheckoutDraft';
import { useAbandonedCart } from './useAbandonedCart';
import CheckoutEmptyCart from './CheckoutEmptyCart';
import CheckoutSuccessScreen from './CheckoutSuccessScreen';
import CheckoutPersonalDataFields from './CheckoutPersonalDataFields';
import CheckoutShippingFields from './CheckoutShippingFields';
import CheckoutPaymentMethodFields from './CheckoutPaymentMethodFields';
import CheckoutOrderSummary from './CheckoutOrderSummary';
import AuthModal from '@/components/auth/AuthModal';
import { useCheckoutAuthGate } from './useCheckoutAuthGate';
import { checkoutSchema, CheckoutFormData } from './checkoutSchema';

function CheckoutHeader() {
  return (
    <div className="mb-8">
      <p className="text-xs text-[#8A8A85] mb-1">
        <Link href="/" className="hover:text-[#F7F6F7]">Inicio</Link> / <Link href="/carrito" className="hover:text-[#F7F6F7]">Carrito</Link> / <span className="text-[#C7C7C0]">Checkout</span>
      </p>
      <h1 className="text-2xl font-black uppercase tracking-tight text-[#F7F6F7]">Completar compra</h1>
    </div>
  );
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, couponCode, setCoupon, updateQuantity, removeItem } = useCartStore();
  const { user, setAuth } = useAuthStore();
  const { mercadopago, transferencia } = usePaymentMethods();
  const { flatRate, freeShippingThreshold } = useShippingRates();
  const [discount, setDiscount] = useState(0);
  const { onSubmit, orderError, orderSuccess, orderNumber } = useCheckoutSubmit({ items, couponCode, clearCart });

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

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '', paymentMethod: 'mercadopago' },
  });

  useCheckoutDraft(watch, reset, transferencia.active === true);
  useInitiateCheckout(items, subtotal);
  const checkoutAuth = useCheckoutAuthGate(user, setAuth, handleSubmit, onSubmit);


  // Queda registrado el carrito de quien deja su email y no termina la compra,
  // para que la tienda pueda recuperarlo desde el backoffice.
  useAbandonedCart(items, { email: watch('email'), name: watch('name'), phone: watch('phone') }, orderSuccess);
  const selectedPayment = watch('paymentMethod');

  // Si el carrito se vacía editándolo acá, el formulario NO se desmonta: al
  // hacerlo se perdía todo lo cargado. La pantalla de carrito vacío queda
  // solo para quien entra directo al checkout sin nada.
  const [huboItems, setHuboItems] = useState(false);
  useEffect(() => {
    if (items.length > 0) setHuboItems(true);
  }, [items.length]);

  useEffect(() => {
    if (orderSuccess) limpiarBorrador();
  }, [orderSuccess]);

  if (items.length === 0 && !orderSuccess && !huboItems) {
    return <CheckoutEmptyCart />;
  }

  if (orderSuccess) return <CheckoutSuccessScreen orderNumber={orderNumber} />;

  return (
    <div className="min-h-screen bg-[#050606]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <CheckoutHeader />

        <form onSubmit={checkoutAuth.handleProtectedSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <CheckoutPersonalDataFields register={register} errors={errors} />
              <CheckoutShippingFields register={register} errors={errors} />
              <CheckoutPaymentMethodFields
                register={register}
                errors={errors}
                selectedPayment={selectedPayment}
                mercadopago={mercadopago}
                transferencia={transferencia}
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
              paymentMethod={selectedPayment}
              onQuantityChange={updateQuantity}
              onRemove={removeItem}
            />
          </div>
        </form>
      </div>
      <AuthModal
        isOpen={checkoutAuth.authOpen}
        returnTo="/checkout"
        onClose={checkoutAuth.closeAuth}
        onAuthenticated={checkoutAuth.handleAuthenticated}
      />
    </div>
  );
}
