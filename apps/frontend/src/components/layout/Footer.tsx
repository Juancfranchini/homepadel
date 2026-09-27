'use client';

import Link from 'next/link';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useMenuCategorias } from '@/hooks/useMenuCategorias';
import BrandLogo from '@/components/ui/BrandLogo';
import FooterPaymentBadges from './FooterPaymentBadges';

const titulo = 'mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#F7F6F7] sm:mb-4 sm:text-sm';

const AYUDA = [
  { label: 'Preguntas frecuentes', href: '/faq' },
  { label: 'Cambios y devoluciones', href: '/politica-de-devolucion' },
  { label: 'Envíos', href: '/envios' },
  { label: 'Medios de pago', href: '/medios-de-pago' },
  { label: 'Guía de talles', href: '/talles' },
  { label: 'Contacto', href: '/contacto' },
];

const REDES = [
  { icon: Instagram, href: 'https://instagram.com/homepadel', label: 'Instagram' },
  { icon: Facebook, href: 'https://facebook.com/homepadel', label: 'Facebook' },
  { icon: Youtube, href: 'https://youtube.com/@homepadel', label: 'YouTube' },
];

function FooterMarca() {
  return (
    <div className="col-span-2 flex items-center justify-between gap-4 md:flex-col md:items-start lg:col-span-1">
      <div>
        <Link href="/" className="mb-0 inline-flex md:mb-4">
          <span className="md:hidden"><BrandLogo size="sm" /></span>
          <span className="hidden md:block"><BrandLogo size="md" /></span>
        </Link>
        <p className="hidden text-sm leading-relaxed md:mb-6 md:block">
          Equipamiento profesional para jugadores apasionados. Las mejores marcas, los mejores precios.
        </p>
      </div>
      <div className="flex gap-2.5">
        {REDES.map(({ icon: Icon, href, label }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-[#B7D31A] hover:text-[#050606]">
            <Icon size={14} />
          </a>
        ))}
      </div>
    </div>
  );
}

function FooterLinks({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className={titulo}>{title}</h3>
      <ul className="space-y-1.5 sm:space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-[13px] transition-colors hover:text-[#B7D31A] sm:text-sm">{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ItemContacto({ icon: Icon, children }: { icon: typeof Mail; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#242A05]"><Icon size={13} className="text-[#B7D31A]" /></span>
      <span className="text-[13px] sm:text-sm">{children}</span>
    </li>
  );
}

/** Solo muestra los datos que estén cargados: un teléfono o una dirección inventados son peores que nada. */
function FooterContacto() {
  const { contactEmail, phone, address } = useSiteSettings();
  return (
    <div className="col-span-2 md:col-span-1">
      <h3 className={titulo}>Contacto</h3>
      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-1 md:gap-3">
        {contactEmail && <ItemContacto icon={Mail}><a href={'mailto:' + contactEmail} className="break-all hover:text-[#B7D31A]">{contactEmail}</a></ItemContacto>}
        {phone && <ItemContacto icon={Phone}><a href={'tel:' + phone} className="hover:text-[#B7D31A]">{phone}</a></ItemContacto>}
        {address && <ItemContacto icon={MapPin}>{address}</ItemContacto>}
        <ItemContacto icon={Clock}>Lunes a Viernes · 9 a 18 hs</ItemContacto>
      </ul>
    </div>
  );
}

export default function Footer() {
  const { mercadopago, transferencia, ca, oca, andreani } = usePaymentMethods();
  const categorias = useMenuCategorias();
  const linksCategorias = [
    ...categorias.map((c) => ({ label: c.name, href: '/catalogo?categoria=' + c.slug })),
    { label: 'Ofertas', href: '/catalogo?oferta=true' },
  ];

  return (
    <footer className="border-t border-[#0D0F0F] bg-[#141A1D] text-[#C7C7C0]">
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-4">
          <FooterMarca />
          <FooterLinks title="Categorías" links={linksCategorias} />
          <FooterLinks title="Ayuda" links={AYUDA} />
          <FooterContacto />
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <FooterPaymentBadges mercadopago={mercadopago} transferencia={transferencia} ca={ca} oca={oca} andreani={andreani} />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-3.5 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-center text-[11px] text-[#8A8A85] sm:text-left sm:text-xs">&copy; 2026 Home Padel - Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="/terminos" className="text-[11px] text-[#8A8A85] transition-colors hover:text-[#C7C7C0] sm:text-xs">Términos y condiciones</Link>
            <Link href="/privacidad" className="text-[11px] text-[#8A8A85] transition-colors hover:text-[#C7C7C0] sm:text-xs">Política de privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
