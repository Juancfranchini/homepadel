import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MetaPixel from '@/components/layout/MetaPixel';
import WhatsAppFloat from '@/components/layout/WhatsAppFloat';
import ModoPruebaAviso from '@/components/layout/ModoPruebaAviso';
import CarritoDeCuenta from '@/components/layout/CarritoDeCuenta';
import FavoritosSync from '@/components/layout/FavoritosSync';
import { getSiteUrl } from '@/lib/siteUrl';
import { SCRIPT_TEMA } from '@/lib/tema';
import { HOME_DESCRIPTION, HOME_TITLE, OPEN_GRAPH_BASE } from '@/lib/seoPortada';

async function getFaviconUrl(): Promise<string> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const baseUrl = apiUrl.replace('/api', '');
    const res = await fetch(apiUrl + '/site-sections/branding', { next: { revalidate: 3600 } });
    const data = await res.json();
    const isotipo = data?.data?.isotipo || data?.isotipo;
    if (isotipo) { if (isotipo.startsWith('data:') || isotipo.startsWith('http')) return isotipo; return baseUrl + isotipo; }
  } catch { }
  // Respaldo si la API no responde: un archivo que existe en public/.
  return '/home-padel-logo.png';
}

export async function generateMetadata(): Promise<Metadata> {
  const faviconUrl = await getFaviconUrl();
  const siteUrl = getSiteUrl();

  return {
    title: {
      default: HOME_TITLE,
      template: '%s | Home Padel',
    },
    description: HOME_DESCRIPTION,
    keywords: [
      'padel',
      'paletas de padel',
      'zapatillas padel',
      'indumentaria padel',
      'accesorios padel',
      'equipamiento padel',
      'home padel',
    ],
    authors: [{ name: 'Home Padel' }],
    creator: 'Home Padel',
    publisher: 'Home Padel',
    formatDetection: { email: false, address: false, telephone: false },
    // Verificación de la propiedad en Google Search Console. No es secreto: Google lo lee del HTML público.
    verification: {
      google: 'afdLYXFIA-0q2Sk5r1bdl3cV-3CxHPe5nrgbRVvi4jg',
      // Verificación del dominio en Meta (Administrador comercial). No es secreta: Meta la lee del HTML público.
      other: { 'facebook-domain-verification': 'r4z38j9gbvmmxtehpqmuq7yg7untd' },
    },
    metadataBase: new URL(siteUrl),
    // Sin `alternates.canonical` a propósito: los metadatos se heredan, y un
    // canonical '/' acá hacía que toda ruta que no lo pisara (/terminos,
    // /privacidad…) le dijera a Google que era un duplicado de la portada.
    // Cada página indexable declara el suyo; el de la portada vive en app/page.tsx.
    // Por lo mismo, openGraph y twitter llevan solo lo común (ver seoPortada.ts).
    // La imagen para compartir la genera app/opengraph-image.tsx: la que se
    // declaraba acá (/og-image.jpg) no existía y los links salían sin imagen.
    openGraph: OPEN_GRAPH_BASE,
    twitter: { card: 'summary_large_image' },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [{ url: faviconUrl }],
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // El tema (oscuro por defecto) lo cambia ThemeToggle; el script lo aplica antes
    // de pintar para que quien eligió el claro no vea un destello oscuro al entrar.
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppFloat />
        <ModoPruebaAviso />
        <CarritoDeCuenta />
        <FavoritosSync />
        <MetaPixel />
      </body>
    </html>
  );
}

