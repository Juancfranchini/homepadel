'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types';

function safeInternalPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/cuenta';
  return value;
}

export function useGoogleAuthCallback() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const started = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (started.current) return;
    const query = new URLSearchParams(window.location.search);
    const status = query.get('google');
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const token = fragment.get('token');

    if (status === 'off' || status === 'error') {
      try {
        sessionStorage.removeItem('homepadel-checkout-resume-after-auth');
      } catch {
        // El mensaje de error se puede mostrar aunque el storage esté bloqueado.
      }
    }
    if (status === 'off') setError('El inicio con Google todavía no está configurado.');
    if (status === 'error') setError('No pudimos iniciar sesión con Google. Intentá nuevamente.');
    if (!token) return;

    started.current = true;
    setBusy(true);
    localStorage.setItem('token', token);
    getMe()
      .then((user: User) => {
        setAuth(user, token);
        const returnTo = safeInternalPath(fragment.get('returnTo'));
        window.history.replaceState(null, '', '/cuenta');
        if (returnTo !== '/cuenta') router.replace(returnTo);
        else setBusy(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        window.history.replaceState(null, '', '/cuenta');
        setError('La sesión de Google no pudo completarse. Intentá nuevamente.');
        setBusy(false);
      });
  }, [router, setAuth]);

  return { busy, error };
}
