'use client';
import Link from 'next/link';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { useBranding } from '@/hooks/useBranding';
import BrandLogo from '@/components/ui/BrandLogo';

export default function Footer() {
  const branding = useBranding();
  return (
    <footer className="bg-[#141A1D] text-[#C7C7C0] border-t border-[#0D0F0F]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">

          {/* Logo + descripcion + redes - 2 columnas */}
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
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#B7D31A] hover:text-[#050606] flex items-center justify-center transition-colors"
                  aria-label={label}
                >
                  <Icon size={14} />
                </a>
              ))}
              <a
                href="https://tiktok.com/@homepadel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#B7D31A] hover:text-[#050606] flex items-center justify-center transition-colors"
                aria-label="TikTok"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.5a8.18 8.18 0 0 0 4.78 1.52V6.56a4.85 4.85 0 0 1-1.01.13z" />
                </svg>
              </a>
              <a
                href="https://youtube.com/@homepadel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#B7D31A] hover:text-[#050606] flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={14} />
              </a>
            </div>
          </div>

          {/* Categorias */}
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
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-[#B7D31A] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-[#F7F6F7] mb-4">Ayuda</h3>
            <ul className="space-y-2">
              {[
                { label: 'Preguntas frecuentes', href: '/faq' },
                { label: 'Cambios y devoluciones', href: '/politica-de-devolucion' },
                { label: 'Envios', href: '/envios' },
                { label: 'Medios de pago', href: '/medios-de-pago' },
                { label: 'Guia de talles', href: '/talles' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-[#B7D31A] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto - 4 filas con iconos */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-[#F7F6F7] mb-4">Contacto</h3>
            <ul className="space-y-4">
              {/* Fila 1: Titulo ya esta arriba, empezamos con los datos */}
              {/* Email */}
              <li>
                <a href="mailto:info@homepadel.com" className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-[#242A05] flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#B7D31A]">
                    <Mail size={14} className="text-[#B7D31A] transition-colors group-hover:text-[#141A1D]" />
                  </div>
                  <span className="text-sm group-hover:text-[#B7D31A] transition-colors">info@homepadel.com</span>
                </a>
              </li>
              {/* Telefono */}
              <li>
                <a href="tel:+541172345678" className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-[#242A05] flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#B7D31A]">
                    <Phone size={14} className="text-[#B7D31A] transition-colors group-hover:text-[#141A1D]" />
                  </div>
                  <span className="text-sm group-hover:text-[#B7D31A] transition-colors">+54 11 7234 5678</span>
                </a>
              </li>
              {/* Direccion */}
              <li className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-[#242A05] flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#B7D31A]">
                  <MapPin size={14} className="text-[#B7D31A] transition-colors group-hover:text-[#141A1D]" />
                </div>
                <span className="text-sm">Av. Padel 1234, CABA</span>
              </li>
              {/* Horario */}
              <li className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-[#242A05] flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#B7D31A]">
                  <Clock size={14} className="text-[#B7D31A] transition-colors group-hover:text-[#141A1D]" />
                </div>
                <span className="text-sm">Lunes a Viernes<br />9 a 18 hs</span>
              </li>
            </ul>
          </div>

          {/* Medios de Pago + Medios de Envio */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-[#F7F6F7] mb-4">Medios de Pago</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="w-10 h-7 bg-white rounded flex items-center justify-center">
                <span className="text-[#1A1F71] text-[7px] font-bold">VISA</span>
              </div>
              <div className="w-10 h-7 bg-black rounded flex items-center justify-center">
                <svg width="24" height="16" viewBox="0 0 24 16">
                  <rect width="24" height="16" rx="2" fill="#000" />
                  <circle cx="9" cy="8" r="4" fill="#FF0000" opacity="0.8" />
                  <circle cx="15" cy="8" r="4" fill="#FF9900" opacity="0.8" />
                </svg>
              </div>
              <div className="w-10 h-7 bg-[#2E77BC] rounded flex items-center justify-center">
                <span className="text-white text-[7px] font-bold">AMEX</span>
              </div>
              <div className="w-10 h-7 bg-[#00A650] rounded flex items-center justify-center">
                <span className="text-white text-[6px] font-bold">MP</span>
              </div>
            </div>

            <h3 className="font-semibold text-sm uppercase tracking-widest text-[#F7F6F7] mb-4">Medios de Envio</h3>
            <div className="flex flex-wrap gap-2">
              <div className="w-10 h-7 bg-[#00509E] rounded flex items-center justify-center">
                <span className="text-white text-[6px] font-bold">CA</span>
              </div>
              <div className="w-10 h-7 bg-[#E30613] rounded flex items-center justify-center">
                <span className="text-white text-[7px] font-bold">OCA</span>
              </div>
              <div className="w-10 h-7 bg-[#003DA5] rounded flex items-center justify-center">
                <span className="text-white text-[5px] font-bold">ANDREANI</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8"><div className="h-[0.5px] bg-white/20" /></div><div className="border-t border-transparent">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[#8A8A85] text-xs">
            &copy; 2026 Home Padel - Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="/terminos" className="text-[#8A8A85] text-xs hover:text-[#C7C7C0] transition-colors">
              Terminos y condiciones
            </Link>
            <Link href="/privacidad" className="text-[#8A8A85] text-xs hover:text-[#C7C7C0] transition-colors">
              Politica de privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}