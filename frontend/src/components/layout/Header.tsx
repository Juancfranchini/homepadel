'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, User, ShoppingCart, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { label: 'Inicio',                href: '/' },
  { label: 'Productos',             href: '/catalogo' },
  { label: 'Contacto',              href: '/contacto' },
  { label: 'Política de Devolución',href: '/politica-de-devolucion' },
];

export default function Header() {
  const totalItems   = useCartStore((s) => s.totalItems);
  const pathname     = usePathname();
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');

  return (
    <header className="w-full sticky top-0 z-50 bg-[#050505] border-b border-white/[0.06]">
      {/* ── Fila superior: búsqueda | logo | iconos ─────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-3 items-center gap-4">

        {/* LEFT — búsqueda */}
        <div className="flex items-center">
          <div className="relative hidden md:flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar"
              className="w-40 lg:w-52 pl-3 pr-8 py-1.5 text-sm bg-[#111] border border-white/[0.08] rounded-md text-white placeholder-gray-600 focus:outline-none focus:border-[#D4FF00]/50 transition-colors"
            />
            <Search size={14} className="absolute right-2.5 text-gray-600" />
          </div>
          {/* Mobile — lupa */}
          <button className="md:hidden text-gray-400 hover:text-white transition-colors" aria-label="Buscar">
            <Search size={20} />
          </button>
        </div>

        {/* CENTER — logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex flex-col items-center gap-0.5 select-none group" aria-label="Home Pádel">
            {/* Ícono pelota */}
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="16" r="15" stroke="#D4FF00" strokeWidth="1.5"/>
              <path d="M4 16 Q10 8 16 16 Q22 24 28 16" stroke="#D4FF00" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M4 16 Q10 24 16 16 Q22 8 28 16" stroke="#D4FF00" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </svg>
            <span className="font-black text-base tracking-tight text-white leading-none uppercase whitespace-nowrap">
              HOME PÁDEL
            </span>
          </Link>
        </div>

        {/* RIGHT — user + cart + hamburger */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/cuenta"
            className="hidden sm:block text-gray-400 hover:text-white transition-colors"
            aria-label="Mi cuenta"
          >
            <User size={20} />
          </Link>

          <Link
            href="/carrito"
            className="relative text-gray-400 hover:text-white transition-colors"
            aria-label="Carrito"
          >
            <ShoppingCart size={20} />
            {totalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#D4FF00] text-[#111] text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {totalItems() > 9 ? '9+' : totalItems()}
              </span>
            )}
          </Link>

          <button
            className="md:hidden text-gray-400 hover:text-white transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menú"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Fila nav — desktop ──────────────────────────────────────────── */}
      <nav className="hidden md:flex items-center justify-center border-t border-white/[0.06]">
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-5 py-2.5 text-[13px] font-semibold uppercase tracking-wide transition-colors whitespace-nowrap ${
                active ? 'text-[#D4FF00]' : 'text-gray-400 hover:text-white'
              }`}
            >
              {link.label}
              {active && (
                <span className="absolute bottom-0 left-5 right-5 h-[2px] bg-[#D4FF00] rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Menú móvil ──────────────────────────────────────────────────── */}
      {open && (
        <nav className="md:hidden border-t border-white/[0.06] bg-[#050505]">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-b border-white/[0.05]">
                <Link
                  href={link.href}
                  className="block px-5 py-3.5 text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/[0.03] transition-colors uppercase tracking-wide"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="border-b border-white/[0.05]">
              <Link
                href="/cuenta"
                className="block px-5 py-3.5 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                onClick={() => setOpen(false)}
              >
                Mi cuenta
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
