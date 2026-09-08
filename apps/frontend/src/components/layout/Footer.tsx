'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useBranding } from '@/hooks/useBranding';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import BrandLogo from '@/components/ui/BrandLogo';
import FooterPaymentBadges from './FooterPaymentBadges';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function Footer() {
  const branding = useBranding();
  const { mercadopago, visa, mastercard, amex, ca, oca, andreani } = usePaymentMethods() as any;
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetch(API_URL + '/site-sections/settings')
      .then((r) => r.json())
      .then((d) => { setSettings(d?.data || d || {}); })
      .catch(() => {});
  }, []);

  // Sin valores de relleno: un dato que no está cargado no se muestra.
  // Publicar un teléfono o una dirección inventados es peor que no mostrar nada,
  // porque el visitante los toma por buenos.
  const phone = settings.phone;
  const email = settings.contactEmail;
  const address = settings.address;

  return (
    <footer className="bg-[#141A1D] text-[#C7C7C0] border-t border-[#0D0F0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-6 lg:gap-4 text-center md:text-left">
          <div className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <BrandLogo variant="light" size="md" showText={!branding.logoFooter} imageUrl={branding.logoFooter || undefined} />
            </Link>
            <p className="text-sm leading-relaxed mb-4 sm:mb-6">Equipamiento profesional para jugadores apasionados. Las mejores marcas, los mejores precios.</p>
            <div className="flex gap-3 justify-center md:justify-start">
              {[{ icon: Instagram, href: 'https://instagram.com/homepadel', label: 'Instagram' },{ icon: Facebook, href: 'https://facebook.com/homepadel', label: 'Facebook' }].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#B7D31A] hover:text-[#050606] flex items-center justify-center transition-colors" aria-label={label}><Icon size={14} /></a>
              ))}
              <a href="https://youtube.com/@homepadel" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#B7D31A] hover:text-[#050606] flex items-center justify-center transition-colors" aria-label="YouTube"><Youtube size={14} /></a>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-widest text-[#F7F6F7] mb-3 sm:mb-4">Categorias</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {[{ label: 'Paletas', href: '/catalogo?categoria=paletas' },{ label: 'Zapatillas', href: '/catalogo?categoria=zapatillas' },{ label: 'Indumentaria', href: '/catalogo?categoria=indumentaria' },{ label: 'Accesorios', href: '/catalogo?categoria=accesorios' },{ label: 'Ofertas', href: '/catalogo?oferta=true' }].map((link) => (
                <li key={link.href}><Link href={link.href} className="text-sm hover:text-[#B7D31A] transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-widest text-[#F7F6F7] mb-3 sm:mb-4">Ayuda</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {[{ label: 'Preguntas frecuentes', href: '/faq' },{ label: 'Rastrear mi pedido', href: '/rastrear' },{ label: 'Cambios y devoluciones', href: '/politica-de-devolucion' },{ label: 'Envíos', href: '/envios' },{ label: 'Medios de pago', href: '/medios-de-pago' },{ label: 'Guia de talles', href: '/talles' }].map((link) => (
                <li key={link.href}><Link href={link.href} className="text-sm hover:text-[#B7D31A] transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 md:col-span-1 lg:col-span-1 flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-widest text-[#F7F6F7] mb-3 sm:mb-4">Contacto</h3>
            <ul className="space-y-4">
              {email && <li className="w-full flex justify-center md:justify-start"><a href={'mailto:' + email} className="flex items-center gap-3 group"><div className="w-8 h-8 rounded-lg bg-[#242A05] flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#B7D31A]"><Mail size={14} className="text-[#B7D31A] transition-colors group-hover:text-[#141A1D]" /></div><span className="text-sm group-hover:text-[#B7D31A] transition-colors break-all">{email}</span></a></li>}
              {phone && <li className="w-full flex justify-center md:justify-start"><a href={'tel:' + phone} className="flex items-center gap-3 group"><div className="w-8 h-8 rounded-lg bg-[#242A05] flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#B7D31A]"><Phone size={14} className="text-[#B7D31A] transition-colors group-hover:text-[#141A1D]" /></div><span className="text-sm group-hover:text-[#B7D31A] transition-colors">{phone}</span></a></li>}
              {address && <li className="flex items-center justify-center md:justify-start gap-3 group"><div className="w-8 h-8 rounded-lg bg-[#242A05] flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#B7D31A]"><MapPin size={14} className="text-[#B7D31A] transition-colors group-hover:text-[#141A1D]" /></div><span className="text-sm">{address}</span></li>}
              <li className="flex items-center justify-center md:justify-start gap-3 group"><div className="w-8 h-8 rounded-lg bg-[#242A05] flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#B7D31A]"><Clock size={14} className="text-[#B7D31A] transition-colors group-hover:text-[#141A1D]" /></div><span className="text-sm">Lunes a Viernes<br />9 a 18 hs</span></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col items-center md:items-start">
            <FooterPaymentBadges mercadopago={mercadopago} visa={visa} mastercard={mastercard} amex={amex} ca={ca} oca={oca} andreani={andreani} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6"><div className="h-[0.5px] bg-white/20" /></div>
      <div className="border-t border-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#8A8A85] text-xs text-center sm:text-left">&copy; 2026 Home Padel - Todos los derechos reservados.</p>
          <div className="flex gap-4 justify-center sm:justify-start">
            <Link href="/terminos" className="text-[#8A8A85] text-xs hover:text-[#C7C7C0] transition-colors">Terminos y condiciones</Link>
            <Link href="/privacidad" className="text-[#8A8A85] text-xs hover:text-[#C7C7C0] transition-colors">Politica de privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
