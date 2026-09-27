import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MetaPixel from '@/components/layout/MetaPixel';
import WhatsAppFloat from '@/components/layout/WhatsAppFloat';
import { getSiteUrl } from '@/lib/siteUrl';

// Título y descripción de la portada (y de lo que se comparte en redes).
// Llevan "pádel" con tilde y "Argentina" porque es como se busca, y solo
// ganchos que la tienda cumple de verdad: el envío gratis por Correo Argentino
// depende del monto que se configura en el backoffice y las cuotas cambian
// con cada promo, así que no se escriben números que después queden viejos.
const HOME_TITLE = 'Home Pádel — Paletas, indumentaria y accesorios de pádel en Argentina';
const HOME_DESCRIPTION =
  'Paletas de pádel Nox, Royal Pádel, Adidas y más, con garantía oficial. Envío gratis a todo el país en compras desde el monto mínimo y cuotas sin interés.';

async function getFaviconUrl(): Promise<string> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const baseUrl = apiUrl.replace('/api', '');
    const res = await fetch(apiUrl + '/site-sections/branding', { next: { revalidate: 3600 } });
    const data = await res.json();
    const isotipo = data?.data?.isotipo || data?.isotipo;
    if (isotipo) { if (isotipo.startsWith('data:') || isotipo.startsWith('http')) return isotipo; return baseUrl + isotipo; }
  } catch { }
  return '/logo-icon.svg';
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
    metadataBase: new URL(siteUrl),
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'es_AR',
      url: siteUrl,
      siteName: 'Home Padel',
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Home Padel' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      images: ['/og-image.jpg'],
    },
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
    <html lang="es">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppFloat />
        <MetaPixel />
      </body>
    </html>
  );
}

