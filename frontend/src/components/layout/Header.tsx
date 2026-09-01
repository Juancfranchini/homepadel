'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { User, ShoppingCart, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { usePathname } from 'next/navigation';
import BrandLogo from '@/components/ui/BrandLogo';
import { useBranding } from '@/hooks/useBranding';
import CartDrawer from '@/components/cart/CartDrawer';

const NAV_LINKS = [
  { label: 'Inicio',                href: '/' },
  { label: 'Productos',             href: '/catalogo' },
  { label: 'Politica de Devolucion', href: '/politica-de-devolucion' },
  { label: 'Preguntas Frecuentes',   href: '/faq' },
  { label: 'Contacto',              href: '/contacto' },
  { label: 'Rastrear Pedido',       href: '/rastrear' },
];

export default function Header() {
  const branding = useBranding();
  const { user, setAuth, isAuthenticated } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const totalItems = useCartStore((s) => s.totalItems);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if ((window as any).google) {
          (window as any).google.accounts.id.initialize({
            client_id: '295795847498-dfja9kjp9klivohbrgacnl6iueo1jm4h.apps.googleusercontent.com',
            callback: handleGoogleResponse,
          });
          const btnRef = document.getElementById('google-login-btn');
          if (btnRef) {
            (window as any).google.accounts.id.renderButton(btnRef, {
              theme: 'outline',
              size: 'medium',
              text: 'signin_with',
              shape: 'rectangular',
              width: 200,
            });
          }
        }
      };
      document.body.appendChild(script);
    }
  }, [user]);

  const handleGoogleResponse = async (response: any) => {
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const { email, name, sub } = payload;
      const res = await api.post('/auth/google', { email, name, googleId: sub });
      if (res.data?.user && res.data?.token) {
        setAuth(res.data.user, res.data.token);
      }
    } catch (error) {
      console.error('Error login Google:', error);
    }
  };

  return (
    <>
      <header className="w-full sticky top-0 z-50 bg-[#050606] border-b border-[#0D0F0F]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <Link href="/" className="flex-shrink-0">
            <BrandLogo variant="light" size="xl" showText={!branding.logoHeader} imageUrl={(isMobile ? (branding.logoMobile || branding.logoHeader) : branding.logoHeader) || undefined}  />
          </Link>

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

          <div className="flex items-center gap-4 flex-shrink-0">
            {user ? (
              <Link href="/cuenta" className="hidden sm:flex items-center gap-2 text-[#C7C7C0] hover:text-[#F7F6F7] border border-[#B7D31A]/30 rounded-full px-3 py-1.5 transition-colors" aria-label="Mi cuenta">
                <User size={18} />
                <span className="text-xs font-semibold truncate max-w-[120px]">{user.name}</span>
              </Link>
            ) : (
              <Link href="/cuenta" className="hidden sm:flex items-center gap-2 bg-[#B7D31A] text-[#050606] rounded-full px-4 py-1.5 font-bold text-xs uppercase tracking-wide transition-colors hover:bg-[#CAE52E]">
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
            <button className="lg:hidden text-[#C7C7C0] hover:text-[#F7F6F7]" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="lg:hidden border-t border-[#0D0F0F] bg-[#050606]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="block py-3 text-sm font-semibold text-[#C7C7C0] hover:text-[#F7F6F7] uppercase tracking-wide" onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <Link href="/cuenta" className="block py-3 text-sm font-semibold text-[#C7C7C0] hover:text-[#F7F6F7]" onClick={() => setOpen(false)}>Mi cuenta</Link>
            </div>
          </nav>
        )}
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
