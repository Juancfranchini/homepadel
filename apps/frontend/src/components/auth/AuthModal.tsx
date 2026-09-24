'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import CuentaAuthForm from '@/app/cuenta/CuentaAuthForm';
import { User } from '@/types';

interface Props {
  isOpen: boolean;
  returnTo: string;
  onClose: () => void;
  onAuthenticated: (user: User, token: string) => void;
}

export default function AuthModal({ isOpen, returnTo, onClose, onAuthenticated }: Props) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    closeButton.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto p-4" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <button className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} aria-label="Cerrar inicio de sesión" />
      <div className="relative my-auto w-full max-w-md">
        <h2 id="auth-modal-title" className="sr-only">Iniciá sesión para continuar con tu compra</h2>
        <button
          ref={closeButton}
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full p-2 text-[#8A8A85] transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#B7D31A]"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
        <CuentaAuthForm embedded returnTo={returnTo} onAuth={onAuthenticated} />
      </div>
    </div>
  );
}
