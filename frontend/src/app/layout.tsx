import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

async function getFaviconUrl(): Promise<string> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const baseUrl = apiUrl.replace('/api', '');
    const res = await fetch(apiUrl + '/site-sections/branding', { next: { revalidate: 3600 } });
    const data = await res.json();
    const isotipo = data?.data?.isotipo || data?.isotipo;
    if (isotipo) return baseUrl + isotipo;
  } catch {}
  return '/logo-icon.svg';
}

export async function generateMetadata(): Promise<Metadata> {
  const faviconUrl = await getFaviconUrl();

  return {
    title: {
      default: 'Home Padel - Equipamiento profesional de padel',
      template: '%s | Home Padel',
    },
    description:
      'Las mejores paletas, indumentaria y accesorios para padel. Nueva temporada 2026 con envios a todo el pais.',
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
    metadataBase: new URL('https://www.homepadel.com.ar'),
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'es_AR',
      url: 'https://www.homepadel.com.ar',
      siteName: 'Home Padel',
      title: 'Home Padel - Equipamiento profesional de padel',
      description: 'Las mejores paletas, indumentaria y accesorios para padel.',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Home Padel' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Home Padel - Equipamiento profesional de padel',
      description: 'Las mejores paletas, indumentaria y accesorios para padel.',
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
      </body>
    </html>
  );
}
