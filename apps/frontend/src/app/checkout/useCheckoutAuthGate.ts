'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { FieldValues, SubmitHandler, UseFormHandleSubmit } from 'react-hook-form';
import { User } from '@/types';

const RESUME_KEY = 'homepadel-checkout-resume-after-auth';

function setResume(value: boolean): void {
  try {
    if (value) sessionStorage.setItem(RESUME_KEY, 'true');
    else sessionStorage.removeItem(RESUME_KEY);
  } catch {
    // El login por email sigue funcionando aunque el storage esté bloqueado.
  }
}

function shouldResume(): boolean {
  try {
    return sessionStorage.getItem(RESUME_KEY) === 'true';
  } catch {
    return false;
  }
}

export function useCheckoutAuthGate<T extends FieldValues>(
  user: User | null,
  setAuth: (user: User, token: string) => void,
  handleSubmit: UseFormHandleSubmit<T>,
  onSubmit: SubmitHandler<T>,
) {
  const [authOpen, setAuthOpen] = useState(false);
  const resumeAfterAuth = useRef(false);

  const handleProtectedSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (user) {
      void handleSubmit(onSubmit)(event);
      return;
    }
    event.preventDefault();
    resumeAfterAuth.current = true;
    setResume(true);
    setAuthOpen(true);
  };

  const closeAuth = () => {
    resumeAfterAuth.current = false;
    setResume(false);
    setAuthOpen(false);
  };

  useEffect(() => {
    if (!user || (!resumeAfterAuth.current && !shouldResume())) return;
    resumeAfterAuth.current = false;
    setResume(false);
    setAuthOpen(false);
    void handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit, user]);

  return {
    authOpen,
    closeAuth,
    handleProtectedSubmit,
    handleAuthenticated: setAuth,
  };
}
