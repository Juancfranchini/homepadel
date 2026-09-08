'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export function useNewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === 'loading') return;

    setStatus('loading');
    try {
      const res = await fetch(API_URL + '/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('Te suscribiste correctamente!');
      } else {
        setStatus('error');
        setMessage(data.message || 'Error al suscribirte');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch {
      setStatus('error');
      setMessage('Error de conexion');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const onEmailChange = (value: string) => {
    setEmail(value);
    if (status === 'error') setStatus('idle');
  };

  return { email, status, message, handleSubmit, onEmailChange };
}
