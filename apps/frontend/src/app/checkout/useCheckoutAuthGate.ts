'use client';

import { FormEvent, useState } from 'react';
import { FieldValues, SubmitHandler, UseFormHandleSubmit } from 'react-hook-form';
import { User } from '@/types';

/**
 * Se compra como invitado: el formulario se manda con o sin sesión. Antes
 * "Finalizar compra" abría el login obligatorio y parte de quienes llegaban
 * desde un anuncio abandonaba ahí. Ingresar queda como opción, para quien
 * quiera ver el pedido en su cuenta o usar sus direcciones guardadas.
 */
export function useCheckoutAuthGate<T extends FieldValues>(
  setAuth: (user: User, token: string) => void,
  handleSubmit: UseFormHandleSubmit<T>,
  onSubmit: SubmitHandler<T>,
  alIngresar?: (user: User) => void,
) {
  const [authOpen, setAuthOpen] = useState(false);

  const handleProtectedSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleSubmit(onSubmit)(event);
  };

  const handleAuthenticated = (user: User, token: string) => {
    setAuth(user, token);
    setAuthOpen(false);
    alIngresar?.(user);
  };

  return {
    authOpen,
    openAuth: () => setAuthOpen(true),
    closeAuth: () => setAuthOpen(false),
    handleProtectedSubmit,
    handleAuthenticated,
  };
}
