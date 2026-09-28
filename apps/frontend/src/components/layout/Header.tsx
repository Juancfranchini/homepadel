'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { User, ShoppingCart, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import BrandLogo from '@/components/ui/BrandLogo';
import CartDrawer from '@/components/cart/CartDrawer';
import CartAddedFeedback from '@/components/cart/CartAddedFeedback';
import MobileNav from './MobileNav';
import HeaderSearch from './HeaderSearch';
import CategoryMegaMenu from './CategoryMegaMenu';
import ThemeToggle from './ThemeToggle';

// Arriba quedan el buscador y las categorías; estos links informativos van en
// el pie de página y al final del menú del celular.
const LINKS_INFO = [
  { label: 'Inicio', href: '/' },
  { label: 'Politica de Devolucion', href: '/politica-de-devolucion' },
  { label: 'Preguntas Frecuentes', href: '/faq' },
  { label: 'Contacto', href: '/contacto' },
  // El rastreo de envíos queda fuera: no hay credenciales del correo y la
  // página no puede informar nada. La ruta /rastrear sigue existiendo.
];

function AccionesUsuario({ onCart, itemCount, mounted }: { onCart: () => void; itemCount: number; mounted: boolean }) {
  const { user } = useAuthStore();
  return (
    <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
      <ThemeToggle />
      {user ? (
        <Link href="/cuenta" className="hidden items-center gap-2 rounded-full border border-[#B7D31A]/30 px-3 py-1.5 text-fg-soft transition-colors hover:text-fg sm:flex" aria-label="Mi cuenta">
          <User size={18} />
          <span className="max-w-[120px] truncate text-xs font-semibold">{user.name}</span>
        </Link>
      ) : (
        <Link href="/cuenta" className="flex items-center gap-2 rounded-full bg-[#B7D31A] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#050606] transition-colors hover:bg-[#CAE52E] sm:px-4">
          Login
        </Link>
      )}
      <button onClick={onCart} className="relative text-fg-soft transition-colors hover:text-fg" aria-label="Carrito">
        <ShoppingCart size={20} />
        {mounted && itemCount > 0 && (
          <span key={itemCount} className="cart-badge-pop absolute -right-2.5 -top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E53935] px-1 text-[10px] font-black text-white shadow-[0_0_0_2px_#101416] light:shadow-[0_0_0_2px_#EFF2EC]">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>
    </div>
  );
}

export default function Header() {
  const [cartOpen, setCartOpen] = useState(false);
  const itemCount = useCartStore((state) => state.items.reduce((total, item) => total + item.quantity, 0));
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#303638] light:border-[#D2D2CA] bg-[#101416]/95 light:bg-[#EFF2EC]/95 shadow-[0_8px_24px_rgba(0,0,0,0.28)] light:shadow-[0_6px_18px_rgba(0,0,0,0.06)] backdrop-blur-xl">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5 sm:gap-4 sm:px-6 lg:gap-8 lg:px-8">
          {/* En móvil: hamburguesa a la izquierda y logo centrado con posición
              absoluta —los costados no miden lo mismo y con flex quedaría corrido—. */}
          <button
            className="flex-shrink-0 rounded-lg border border-fg/10 bg-chip p-2 text-fg-soft transition-colors hover:border-[#B7D31A]/50 hover:bg-[#242A2D] light:hover:bg-[#E4E4DD] hover:text-fg lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:flex-shrink-0 lg:translate-x-0" aria-label="Home Pádel — Inicio">
            <span className="lg:hidden"><BrandLogo size="sm" priority /></span>
            <span className="hidden lg:block"><BrandLogo size="md" priority /></span>
          </Link>

          <div className="hidden max-w-2xl flex-1 lg:block">
            <HeaderSearch />
          </div>

          <AccionesUsuario onCart={() => setCartOpen(true)} itemCount={itemCount} mounted={mounted} />
        </div>

        <div className="px-4 pb-2.5 sm:px-6 lg:hidden">
          <HeaderSearch onSearch={() => setOpen(false)} />
        </div>

        <div className="hidden border-t border-fg/[0.06] lg:block">
          <CategoryMegaMenu />
        </div>

        {open && <MobileNav links={LINKS_INFO} onNavigate={() => setOpen(false)} />}
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <CartAddedFeedback />
    </>
  );
}
