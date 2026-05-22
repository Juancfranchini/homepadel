'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, User, ShoppingCart, Menu, X, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

const NAV_LINKS = [
  { label: 'Paletas', href: '/catalogo?categoria=paletas' },
  { label: 'Zapatillas', href: '/catalogo?categoria=zapatillas' },
  { label: 'Indumentaria', href: '/catalogo?categoria=indumentaria' },
  { label: 'Accesorios', href: '/catalogo?categoria=accesorios' },
  { label: 'Ofertas', href: '/catalogo?oferta=true' },
  { label: 'Marcas', href: '/marcas' },
];

export default function Header() {
  const totalItems = useCartStore((s) => s.totalItems);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="w-full sticky top-0 z-50">
      {/* ── Barra de anuncio superior ──────────────────────────────────────── */}
      <div className="bg-[#111] text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-xs flex-1 text-center">
            Envíos a todo el país &bull; Hasta 6 cuotas sin interés
          </p>
          <button className="text-xs flex items-center gap-1 text-gray-400 hover:text-white transition-colors flex-none">
            AYUDA <ChevronDown size={12} />
          </button>
        </div>
      </div>

      {/* ── Header principal ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-none select-none">
            <div className="w-8 h-8 rounded-full bg-[#C8FF00] flex items-center justify-center flex-none">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="8" fill="#111" />
                <path d="M5 9 Q7 5 9 9 Q11 13 13 9" stroke="#C8FF00" strokeWidth="1.2" fill="none" />
                <path d="M5 9 Q7 13 9 9 Q11 5 13 9" stroke="#C8FF00" strokeWidth="1.2" fill="none" />
              </svg>
            </div>
            <span className="font-black text-lg tracking-tight text-[#111] leading-none">
              HOME PÁDEL
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-0 flex-1 justify-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-semibold text-[#333] hover:text-[#111] transition-colors whitespace-nowrap relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#C8FF00] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            ))}
          </nav>

          {/* Búsqueda + iconos */}
          <div className="flex items-center gap-3 flex-none ml-auto md:ml-0">
            <div className="hidden md:flex items-center relative">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Buscar productos..."
                className="w-44 lg:w-52 pl-4 pr-9 py-2 text-sm border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:border-[#111] transition-colors"
              />
              <Search size={15} className="absolute right-3 text-gray-400" />
            </div>

            <button className="md:hidden text-[#111] hover:text-[#C8FF00] transition-colors">
              <Search size={20} />
            </button>

            <Link
              href="/cuenta"
              className="text-[#111] hover:text-[#C8FF00] transition-colors hidden sm:block"
              aria-label="Mi cuenta"
            >
              <User size={22} />
            </Link>

            <Link
              href="/carrito"
              className="relative text-[#111] hover:text-[#C8FF00] transition-colors"
              aria-label="Carrito de compras"
            >
              <ShoppingCart size={22} />
              {totalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#C8FF00] text-[#111] text-xs font-black rounded-full w-5 h-5 flex items-center justify-center leading-none">
                  {totalItems() > 99 ? '99+' : totalItems()}
                </span>
              )}
            </Link>

            <button
              className="md:hidden text-[#111] hover:text-[#C8FF00] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menú"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Menú móvil ──────────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block px-5 py-3.5 text-sm font-semibold text-[#111] hover:bg-gray-50 border-b border-gray-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/cuenta"
                className="block px-5 py-3.5 text-sm font-semibold text-[#111] hover:bg-gray-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
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
