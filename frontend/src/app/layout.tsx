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
    'home padel',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'Home Pádel',
    images: [{ url: '/logo-full.svg', width: 400, height: 180, alt: 'Home Pádel' }],
  },
  twitter: {
    card: 'summary',
    title: 'Home Pádel',
    description: 'Equipamiento profesional para jugadores apasionados.',
    images: ['/logo-full.svg'],
  },
  icons: {
    // Favicon: logo oficial (chevron + pelota)
    icon: [
      {
        url: '/logo-icon.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/logo-icon.svg',
    apple: '/logo-icon.svg',
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
