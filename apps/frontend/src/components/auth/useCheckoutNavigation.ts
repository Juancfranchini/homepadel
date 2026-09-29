'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { avisarInicioDeCheckout } from '@/lib/inicioCheckout';

/**
 * "Finalizar compra" lleva directo al checkout, con o sin sesión: se compra
 * como invitado. Antes pedía el login acá y parte de la gente se iba.
 */
export function useCheckoutNavigation(beforeNavigate?: () => void) {
  const { user } = useAuthStore();
  const router = useRouter();

  const handleCheckout = () => {
    avisarInicioDeCheckout(useCartStore.getState().items, user ? { email: user.email, phone: user.phone } : undefined);
    beforeNavigate?.();
    router.push('/checkout');
  };

  return { handleCheckout };
}
