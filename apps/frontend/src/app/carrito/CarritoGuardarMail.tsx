'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Check } from 'lucide-react';
import { CartItem } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { saveAbandonedCart } from '@/lib/api';
import { guardarContacto } from '@/lib/contactoComprador';
import { modoPruebaActivo } from '@/lib/modoPrueba';

const schema = z.object({ email: z.string().trim().toLowerCase().email('Revisá el mail') });
type Datos = z.infer<typeof schema>;

const CLAVE = 'hp_carrito_guardado';

/**
 * Mail opcional en el carrito: "¿lo terminás después? te lo guardamos".
 *
 * Antes del checkout, quien no tenía cuenta era anónimo: si se iba, no había a
 * quién escribirle, y los eventos de Meta (AddToCart, InitiateCheckout) no
 * tenían con qué reconocerlo. Con el mail, el carrito queda en Carritos
 * abandonados y los eventos siguientes lo llevan cifrado (contactoComprador).
 * No se muestra a quien tiene sesión: de esa cuenta ya se sabe el mail.
 */
export default function CarritoGuardarMail({ items }: { items: CartItem[] }) {
  const usuario = useAuthStore((s) => s.user);
  const [guardado, setGuardado] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Datos>({ resolver: zodResolver(schema) });

  useEffect(() => {
    try { setGuardado(sessionStorage.getItem(CLAVE) === '1'); } catch { /* sin almacenamiento */ }
  }, []);

  if (usuario || items.length === 0) return null;

  if (guardado) {
    return (
      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-green-500 light:text-green-700">
        <Check size={14} /> Te guardamos el carrito.
      </p>
    );
  }

  const guardar = async ({ email }: Datos) => {
    guardarContacto(email);
    if (!modoPruebaActivo()) {
      const carrito = items.map((i) => ({ productId: i.product.id, variantId: i.variantId, quantity: i.quantity }));
      // Falla en silencio: es una ayuda, no puede trabar la compra.
      await saveAbandonedCart({ email, items: carrito }).catch(() => {});
    }
    try { sessionStorage.setItem(CLAVE, '1'); } catch { /* sin almacenamiento */ }
    setGuardado(true);
  };

  return (
    <form onSubmit={handleSubmit(guardar)} noValidate className="mt-5 border-t border-line pt-4">
      <label htmlFor="carrito-mail" className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-fg">
        <Mail size={13} /> ¿Lo terminás después? Te guardamos el carrito
      </label>
      <div className="flex gap-2">
        <input
          id="carrito-mail" type="email" autoComplete="email" inputMode="email" placeholder="tu@mail.com"
          {...register('email')}
          className="min-w-0 flex-1 rounded-lg border border-line bg-field px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus:border-[#B7D31A] focus:outline-none"
        />
        <button type="submit" disabled={isSubmitting} className="shrink-0 rounded-lg border border-[#B7D31A]/50 px-3 py-2 text-xs font-bold text-brand-fg hover:bg-[#B7D31A]/10 disabled:opacity-50">
          Guardar
        </button>
      </div>
      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      <p className="mt-1.5 text-[11px] text-fg-muted">Solo lo usamos para ayudarte con esta compra.</p>
    </form>
  );
}
