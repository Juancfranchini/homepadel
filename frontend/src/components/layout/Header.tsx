'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { User, ShoppingCart, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { usePathname } from 'next/navigation';
import BrandLogo from '@/components/ui/BrandLogo';

const NAV_LINKS = [
  { label: 'Inicio',                href: '/' },
  { label: 'Productos',             href: '/catalogo' },
  { label: 'Politica de Devolucion', href: '/politica-de-devolucion' },
  { label: 'FAQ',                   href: '/faq' },
  { label: 'Contacto',              href: '/contacto' },
];

export default function Header() {
  const totalItems = useCartStore((s) => s.totalItems);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <header className="w-full sticky top-0 z-50 glass border-b border-[#0D0F0F]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex-shrink-0">
          <BrandLogo variant="light" size="md" showText={true} />
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={'relative px-3 py-2 text-[11px] font-semibold uppercase tracking-wide transition-colors whitespace-nowrap ' +
                  (active ? 'text-[#B7D31A]' : 'text-[#C7C7C0] hover:text-[#F7F6F7]')}
              >
                {link.label}
                {active && <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#B7D31A] rounded-full" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 flex-shrink-0">
          <Link href="/cuenta" className="hidden sm:block text-[#C7C7C0] hover:text-[#F7F6F7] transition-colors" aria-label="Mi cuenta">
            <User size={20} />
          </Link>
          <Link href="/carrito" className="relative text-[#C7C7C0] hover:text-[#F7F6F7] transition-colors" aria-label="Carrito">
            <ShoppingCart size={20} />
            {mounted && totalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#B7D31A] text-[#050606] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems() > 9 ? '9+' : totalItems()}
              </span>
            )}
          </Link>
          <button className="lg:hidden text-[#C7C7C0] hover:text-[#F7F6F7]" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-[#0D0F0F] bg-[#050606]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-3 text-sm font-semibold text-[#C7C7C0] hover:text-[#F7F6F7] uppercase tracking-wide"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/cuenta" className="block py-3 text-sm font-semibold text-[#C7C7C0] hover:text-[#F7F6F7]" onClick={() => setOpen(false)}>
              Mi cuenta
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}