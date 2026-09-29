'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bolsasEfectivas, useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useShippingRates } from '@/hooks/useShippingRates';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useCoupon } from '@/hooks/useCoupon';
import { subtotalConTransferencia } from '@/lib/productPricing';
import { useInitiateCheckout } from './useInitiateCheckout';
import { useCheckoutSubmit } from './useCheckoutSubmit';
import { limpiarBorrador, useCheckoutDraft } from './useCheckoutDraft';
import { useAbandonedCart } from './useAbandonedCart';
import CheckoutEmptyCart from './CheckoutEmptyCart';
import CheckoutSuccessScreen from './CheckoutSuccessScreen';
import CheckoutFormSections from './CheckoutFormSections';
import CheckoutOrderSummary from './CheckoutOrderSummary';
import AuthModal from '@/components/auth/AuthModal';
import { useCheckoutAuthGate } from './useCheckoutAuthGate';
import { useCheckoutFlex } from './useCheckoutFlex';
import { useDireccionesCheckout } from './useDireccionesCheckout';
import { checkoutSchema, CheckoutFormData } from './checkoutSchema';

function CheckoutHeader() {
  return (
    <div className="mb-8">
      <p className="text-xs text-fg-muted mb-1">
        <Link href="/" className="hover:text-fg">Inicio</Link> / <Link href="/carrito" className="hover:text-fg">Carrito</Link> / <span className="text-fg-soft">Checkout</span>
      </p>
      <h1 className="text-2xl font-black uppercase tracking-tight text-fg">Completar compra</h1>
    </div>
  );
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, couponCode, salesLinkToken, updateQuantity, removeItem, bolsasRegalo } = useCartStore();
  const { user, setAuth } = useAuthStore();
  const { mercadopago, transferencia } = usePaymentMethods();
  const { flatRate, freeShippingThreshold } = useShippingRates();
  const settings = useSiteSettings();
  const { onSubmit, orderError, orderSuccess, orderNumber, pedidoTransferencia } = useCheckoutSubmit({ items, couponCode, salesLinkToken, clearCart, whatsapp: settings.whatsapp || settings.phone, bolsasRegalo: bolsasEfectivas(bolsasRegalo, items) });

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset, setValue } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '', shippingMethod: 'correo_argentino', paymentMethod: 'mercadopago' },
  });
  const selectedPayment = watch('paymentMethod');

  // Pagando por transferencia cada producto sale a su precio de transferencia
  // (el servidor cobra lo mismo): cupón y envío gratis se calculan sobre eso.
  const subtotalLista = totalPrice();
  const subtotal = selectedPayment === 'transfer' ? subtotalConTransferencia(items) : subtotalLista;
  const coupon = useCoupon(subtotal);
  const { discount } = coupon;
  // Estimación para mostrar en pantalla — el servidor recalcula envío y
  // descuento al crear la orden o la preferencia de pago (P1/P2); esto nunca
  // es lo que se cobra de verdad.
  const correoCost = subtotal >= freeShippingThreshold ? 0 : flatRate;

  useCheckoutDraft(watch, reset, transferencia.active === true);
  useInitiateCheckout(items, user ? { email: user.email, phone: user.phone } : undefined);
  const checkoutAuth = useCheckoutAuthGate(user, setAuth, handleSubmit, onSubmit);


  // Queda registrado el carrito de quien deja su email y no termina la compra,
  // para que la tienda pueda recuperarlo desde el backoffice.
  useAbandonedCart(items, { email: watch('email'), name: watch('name'), phone: watch('phone') }, orderSuccess);
  const selectedShipping = watch('shippingMethod');
  const flex = useCheckoutFlex(watch, setValue);
  const guardadas = useDireccionesCheckout(Boolean(user), setValue);
  const shippingToCoordinate = selectedShipping === 'andreani' || selectedShipping === 'oca';
  const shippingCost = selectedShipping === 'correo_argentino' ? correoCost : selectedShipping === 'flex' ? flex.zona?.precio ?? 0 : 0;
  const total = subtotal + shippingCost - discount;

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

  if (orderSuccess) return <CheckoutSuccessScreen orderNumber={orderNumber} pedido={pedidoTransferencia} whatsapp={settings.whatsapp || settings.phone} />;

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <CheckoutHeader />

        <form onSubmit={checkoutAuth.handleProtectedSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <CheckoutFormSections
              register={register} errors={errors} selectedShipping={selectedShipping} selectedPayment={selectedPayment}
              correoCost={correoCost} shippingToCoordinate={shippingToCoordinate}
              mercadopago={mercadopago} transferencia={transferencia}
              storeAddress={settings.address} flex={flex}
              direcciones={guardadas.direcciones} onUsarDireccion={(d) => guardadas.usar(d, watch('phone'))}
            />

            <CheckoutOrderSummary
              items={items}
              subtotal={subtotal}
              ahorroTransferencia={subtotalLista - subtotal}
              coupon={coupon}
              shippingCost={shippingCost}
              total={total}
              orderError={orderError}
              isSubmitting={isSubmitting}
              paymentMethod={selectedPayment}
              shippingToCoordinate={shippingToCoordinate}
              shippingPending={flex.esFlex && !flex.zona}
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
