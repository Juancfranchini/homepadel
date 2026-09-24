'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types';

export function useCheckoutNavigation(beforeNavigate?: () => void) {
  const { user, setAuth } = useAuthStore();
  const [authOpen, setAuthOpen] = useState(false);
  const router = useRouter();

  const goToCheckout = () => {
    beforeNavigate?.();
    router.push('/checkout');
  };

  const handleCheckout = () => {
    if (user) goToCheckout();
    else setAuthOpen(true);
  };

  const handleAuthenticated = (authenticatedUser: User, token: string) => {
    setAuth(authenticatedUser, token);
    setAuthOpen(false);
    goToCheckout();
  };

  return {
    authOpen,
    closeAuth: () => setAuthOpen(false),
    handleCheckout,
    handleAuthenticated,
  };
}
