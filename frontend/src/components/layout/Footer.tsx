'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useBranding } from '@/hooks/useBranding';
import BrandLogo from '@/components/ui/BrandLogo';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function Footer() {
  const branding = useBranding();
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetch(API_URL + '/site-sections/settings')
      .then((r) => r.json())
      .then((d) => {
        const data = d?.data || d;
        setSettings(data || {});
      })
      .catch(() => {});
  }, []);

  const phone = settings.phone || '+54 11 7234 5678';
  const email = settings.contactEmail || 'info@homepadel.com';
  const address = settings.address || 'Av. Padel 1234, CABA';
  const whatsapp = settings.whatsapp || '';

  return (
    <footer className="bg-[#141A1D] text-[#C7C7C0] border-t border-[#0D0F0F]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">

          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <BrandLogo variant="light" size="sm" showText={!branding.logoFooter} imageUrl={branding.logoFooter || undefined} />
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Equipamiento profesional para jugadores apasionados. Las mejores marcas, los mejores precios.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: 'https://instagram.com/homepadel', label: 'Instagram' },
                { icon: Facebook, href: 'https://facebook.com/homepadel', label: 'Facebook' },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#B7D31A] hover:text-[#050606] flex items-center justify-center transition-colors"
                  aria-label={label}><Icon size={14} /></a>
              ))}
              <a href="https://youtube.com/@homepadel" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#B7D31A] hover:text-[#050606] flex items-center justify-center transition-colors"
                aria-label="YouTube"><Youtube size={14} /></a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-[#F7F6F7] mb-4">Categorias</h3>
            <ul className="space-y-2">
              {[
                { label: 'Paletas', href: '/catalogo?categoria=paletas' },
                { label: 'Zapatillas', href: '/catalogo?categoria=zapatillas' },
                { label: 'Indumentaria', href: '/catalogo?categoria=indumentaria' },
                { label: 'Accesorios', href: '/catalogo?categoria=accesorios' },
                { label: 'Ofertas', href: '/catalogo?oferta=true' },
              ].map((link) => (
                <li key={link.href}><Link href={link.href} className="text-sm hover:text-[#B7D31A] transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-[#F7F6F7] mb-4">Ayuda</h3>
            <ul className="space-y-2">
              {[
                { label: 'Preguntas frecuentes', href: '/faq' },
                { label: 'Rastrear mi pedido', href: '/rastrear' },
                { label: 'Cambios y devoluciones', href: '/politica-de-devolucion' },
                { label: 'Envios', href: '/envios' },
                { label: 'Medios de pago', href: '/medios-de-pago' },
                { label: 'Guia de talles', href: '/talles' },
              ].map((link) => (
                <li key={link.href}><Link href={link.href} className="text-sm hover:text-[#B7D31A] transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-[#F7F6F7] mb-4">Contacto</h3>
            <ul className="space-y-4">
              <li>
                <a href={'mailto:' + email} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-[#242A05] flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#B7D31A]">
                    <Mail size={14} className="text-[#B7D31A] transition-colors group-hover:text-[#141A1D]" />
                  </div>
                  <span className="text-sm group-hover:text-[#B7D31A] transition-colors">{email}</span>
                </a>
              </li>
              <li>
                <a href={'tel:' + phone} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-[#242A05] flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#B7D31A]">
                    <Phone size={14} className="text-[#B7D31A] transition-colors group-hover:text-[#141A1D]" />
                  </div>
                  <span className="text-sm group-hover:text-[#B7D31A] transition-colors">{phone}</span>
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-[#242A05] flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#B7D31A]">
                  <MapPin size={14} className="text-[#B7D31A] transition-colors group-hover:text-[#141A1D]" />
                </div>
                <span className="text-sm">{address}</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-[#242A05] flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#B7D31A]">
                  <Clock size={14} className="text-[#B7D31A] transition-colors group-hover:text-[#141A1D]" />
                </div>
                <span className="text-sm">Lunes a Viernes<br />9 a 18 hs</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-[#F7F6F7] mb-4">Medios de Pago</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="w-10 h-7 bg-white rounded flex items-center justify-center"><span className="text-[#1A1F71] text-[7px] font-bold">VISA</span></div>
              <div className="w-10 h-7 bg-black rounded flex items-center justify-center">
                <svg width="24" height="16" viewBox="0 0 24 16"><rect width="24" height="16" rx="2" fill="#000" /><circle cx="9" cy="8" r="4" fill="#FF0000" opacity="0.8" /><circle cx="15" cy="8" r="4" fill="#FF9900" opacity="0.8" /></svg>
              </div>
              <div className="w-10 h-7 bg-[#2E77BC] rounded flex items-center justify-center"><span className="text-white text-[7px] font-bold">AMEX</span></div>
              <div className="w-10 h-7 bg-[#00A650] rounded flex items-center justify-center"><span className="text-white text-[6px] font-bold">MP</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8"><div className="h-[0.5px] bg-white/20" /></div>
      <div className="border-t border-transparent">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[#8A8A85] text-xs">&copy; 2026 Home Padel - Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="/terminos" className="text-[#8A8A85] text-xs hover:text-[#C7C7C0] transition-colors">Terminos y condiciones</Link>
            <Link href="/privacidad" className="text-[#8A8A85] text-xs hover:text-[#C7C7C0] transition-colors">Politica de privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
