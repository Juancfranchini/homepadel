// Footer principal de Home Pádel
// Fondo oscuro (#111) con logo, descripción, redes sociales, 4 columnas de links y barra de copyright

import Link from 'next/link';
import { Instagram, Facebook, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#111] text-white">
      {/* ── Contenido principal ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Logo + descripción + redes — ocupa 2 columnas */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="16" cy="16" r="15" fill="#C8FF00" />
                <circle cx="16" cy="16" r="11" fill="#111" />
                <path
                  d="M10 16 Q13 10 16 16 Q19 22 22 16"
                  stroke="#C8FF00"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M10 16 Q13 22 16 16 Q19 10 22 16"
                  stroke="#C8FF00"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
              <span className="font-black text-xl tracking-tight text-white leading-none">
                HOME<span className="text-[#C8FF00]">.</span>PÁDEL
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Equipamiento profesional para jugadores apasionados. Las mejores
              marcas, los mejores precios.
            </p>
            {/* Redes sociales */}
            <div className="flex gap-3">
              <a
                href="https://instagram.com/homepadel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#C8FF00] hover:text-black flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://facebook.com/homepadel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#C8FF00] hover:text-black flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://tiktok.com/@homepadel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#C8FF00] hover:text-black flex items-center justify-center transition-colors"
                aria-label="TikTok"
              >
                {/* TikTok icon (Lucide no tiene, usamos SVG simple) */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.5a8.18 8.18 0 0 0 4.78 1.52V6.56a4.85 4.85 0 0 1-1.01.13z" />
                </svg>
              </a>
              <a
                href="https://youtube.com/@homepadel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#C8FF00] hover:text-black flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Columna CATEGORÍAS */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-white mb-4">
              Categorías
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'Paletas', href: '/catalogo?categoria=paletas' },
                { label: 'Zapatillas', href: '/catalogo?categoria=zapatillas' },
                { label: 'Indumentaria', href: '/catalogo?categoria=indumentaria' },
                { label: 'Accesorios', href: '/catalogo?categoria=accesorios' },
                { label: 'Ofertas', href: '/catalogo?oferta=true' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-[#C8FF00] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna AYUDA */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-white mb-4">
              Ayuda
            </h3>
            <ul className="space-y-2">
              {[
                { label: 'Preguntas frecuentes', href: '/faq' },
                { label: 'Cambios y devoluciones', href: '/cambios' },
                { label: 'Envíos', href: '/envios' },
                { label: 'Medios de pago', href: '/medios-de-pago' },
                { label: 'Guía de talles', href: '/talles' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-[#C8FF00] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna CONTACTO */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-white mb-4">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-[#C8FF00] mt-0.5">✉</span>
                <a
                  href="mailto:info@homepadel.com"
                  className="text-gray-400 text-sm hover:text-white transition-colors"
                >
                  info@homepadel.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C8FF00] mt-0.5">✆</span>
                <a
                  href="tel:+541172345678"
                  className="text-gray-400 text-sm hover:text-white transition-colors"
                >
                  +54 11 7234 5678
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C8FF00] mt-0.5">◷</span>
                <span className="text-gray-400 text-sm">
                  Lunes a Viernes
                  <br />9 a 18 hs
                </span>
              </li>
            </ul>
          </div>

          {/* Columna FORMAS DE PAGO */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-widest text-white mb-4">
              Formas de pago
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {['VISA', 'MC', 'AMEX', 'MP'].map((card) => (
                <span
                  key={card}
                  className="bg-white/10 text-white text-xs font-bold px-2 py-1 rounded border border-white/20"
                >
                  {card}
                </span>
              ))}
            </div>
            <p className="text-[#C8FF00] text-xs font-semibold">
              Hasta 6 cuotas sin interés
            </p>
            <p className="text-gray-400 text-xs mt-1">en todos los productos</p>
          </div>
        </div>
      </div>

      {/* ── Barra de copyright ──────────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-xs">
            © 2026 Home Pádel · Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link
              href="/terminos"
              className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
            >
              Términos y condiciones
            </Link>
            <Link
              href="/privacidad"
              className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
            >
              Política de privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
