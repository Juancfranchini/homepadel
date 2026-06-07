// Layout raíz de Next.js 15
// Aplica metadatos SEO globales, fuente Inter, header y footer en todas las páginas
// Envuelve el contenido principal en <main> para accesibilidad

import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Home Pádel — Equipamiento profesional',
    template: '%s | Home Pádel',
  },
  description:
    'Las mejores paletas, indumentaria y accesorios para pádel. Nueva temporada 2026 con hasta 20% OFF.',
  keywords: [
    'padel',
    'paletas',
    'zapatillas padel',
    'indumentaria padel',
    'accesorios padel',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'Home Pádel',
  },
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="%230A0A0A"/><circle cx="16" cy="16" r="14" stroke="%23D4FF00" stroke-width="1.2" fill="none"/><path d="M6 16 Q11 9 16 16 Q21 23 26 16" stroke="%23D4FF00" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M6 16 Q11 23 16 16 Q21 9 26 16" stroke="%23D4FF00" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
