'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { User, ShoppingCart, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { usePathname } from 'next/navigation';
import BrandLogo from '@/components/ui/BrandLogo';
import CartDrawer from '@/components/cart/CartDrawer';
import MobileNav from './MobileNav';

const NAV_LINKS = [
  { label: 'Inicio',                href: '/' },
  { label: 'Productos',             href: '/catalogo' },
  { label: 'Politica de Devolucion', href: '/politica-de-devolucion' },
  { label: 'Preguntas Frecuentes',   href: '/faq' },
  { label: 'Contacto',              href: '/contacto' },
  { label: 'Rastrear Pedido',       href: '/rastrear' },
];

export default function Header() {
  const { user } = useAuthStore();
  const [cartOpen, setCartOpen] = useState(false);

  const totalItems = useCartStore((s) => s.totalItems);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      <header className="w-full sticky top-0 z-50 bg-[#050606] border-b border-[#0D0F0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
          {/* En móvil el logo va chico y a la izquierda: en xl ocupaba media
              pantalla de alto y empujaba el contenido fuera de la vista. */}
          <Link href="/" className="flex-shrink-0" aria-label="Home Pádel — Inicio">
            <span className="lg:hidden"><BrandLogo size="sm" priority /></span>
            <span className="hidden lg:block"><BrandLogo size="xl" priority /></span>
          </Link>

          <button
            className="lg:hidden text-[#C7C7C0] transition-colors hover:text-[#F7F6F7]"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href}
                  className={'relative px-3 py-2 text-[11px] font-semibold uppercase tracking-wide transition-colors whitespace-nowrap ' +
                    (active ? 'text-[#B7D31A]' : 'text-[#C7C7C0] hover:text-[#F7F6F7]')}>
                  {link.label}
                  {active && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#B7D31A] rounded-full" />}
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
              {mounted && totalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#B7D31A] text-[#050606] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems() > 9 ? '9+' : totalItems()}
                </span>
              )}
            </button>
          </div>
        </div>

        {open && <MobileNav links={NAV_LINKS} onNavigate={() => setOpen(false)} />}
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
