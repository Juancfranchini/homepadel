'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { User, ShoppingCart, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { usePathname } from 'next/navigation';
import BrandLogo from '@/components/ui/BrandLogo';
import CartDrawer from '@/components/cart/CartDrawer';
import CartAddedFeedback from '@/components/cart/CartAddedFeedback';
import MobileNav from './MobileNav';
import { isNavActive } from './navState';

const NAV_LINKS = [
  { label: 'Inicio',                href: '/' },
  { label: 'Productos',             href: '/catalogo' },
  { label: 'Politica de Devolucion', href: '/politica-de-devolucion' },
  { label: 'Preguntas Frecuentes',   href: '/faq' },
  { label: 'Contacto',              href: '/contacto' },
  // El rastreo de envíos queda fuera del menú: no hay credenciales del correo
  // y la página no puede informar nada. La ruta /rastrear sigue existiendo,
  // así que reponerlo es volver a agregar esta línea.
];

export default function Header() {
  const { user } = useAuthStore();
  const [cartOpen, setCartOpen] = useState(false);

  const itemCount = useCartStore((state) => state.items.reduce((total, item) => total + item.quantity, 0));
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <header className="w-full sticky top-0 z-50 border-b border-[#303638] bg-[#101416]/95 shadow-[0_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
          {/* En móvil: hamburguesa a la izquierda y logo centrado. El logo se
              centra con posición absoluta y no con flex, porque los bloques de
              los costados no miden lo mismo —un ícono contra login + carrito—
              y quedaría corrido. En escritorio vuelve al flujo normal, que al
              estar oculta la hamburguesa lo deja primero, a la izquierda. */}
          <button
            className="lg:hidden flex-shrink-0 rounded-lg border border-white/10 bg-[#1A1F21] p-2 text-[#C7C7C0] transition-colors hover:border-[#B7D31A]/50 hover:bg-[#242A2D] hover:text-[#F7F6F7]"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:flex-shrink-0"
            aria-label="Home Pádel — Inicio"
          >
            <span className="lg:hidden"><BrandLogo size="sm" priority /></span>
            {/* En escritorio estaba en `xl` (147×110): a 110px de alto agrandaba
                el header entero y se veía desmedido. `md` lo deja en 93×70. */}
            <span className="hidden lg:block"><BrandLogo size="md" priority /></span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-xl border border-white/10 bg-[#171B1D] p-1 shadow-inner lg:flex" aria-label="Navegación principal">
            {NAV_LINKS.map((link) => {
              const active = isNavActive(pathname, link.href);
              return (
                <Link key={link.href} href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={'rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-wide transition-all whitespace-nowrap ' +
                    (active ? 'bg-[#B7D31A] text-[#050606] shadow-[0_2px_10px_rgba(183,211,26,0.2)]' : 'text-[#C7C7C0] hover:bg-white/[0.07] hover:text-[#F7F6F7]')}>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {user ? (
              <Link href="/cuenta" className="hidden sm:flex items-center gap-2 text-[#C7C7C0] hover:text-[#F7F6F7] border border-[#B7D31A]/30 rounded-full px-3 py-1.5 transition-colors" aria-label="Mi cuenta">
                <User size={18} />
                <span className="text-xs font-semibold truncate max-w-[120px]">{user.name}</span>
              </Link>
            ) : (
              <Link href="/cuenta" className="flex items-center gap-2 bg-[#B7D31A] text-[#050606] rounded-full px-3 sm:px-4 py-1.5 font-bold text-xs uppercase tracking-wide transition-colors hover:bg-[#CAE52E]">
                Login
              </Link>
            )}
            <button onClick={() => setCartOpen(true)} className="relative text-[#C7C7C0] hover:text-[#F7F6F7] transition-colors" aria-label="Carrito">
              <ShoppingCart size={20} />
              {mounted && itemCount > 0 && (
                <span key={itemCount} className="cart-badge-pop absolute -right-2.5 -top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E53935] px-1 text-[10px] font-black text-white shadow-[0_0_0_2px_#101416]">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {open && <MobileNav links={NAV_LINKS} onNavigate={() => setOpen(false)} />}
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <CartAddedFeedback />
    </>
  );
}
