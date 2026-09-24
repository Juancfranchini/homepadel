import type { Metadata } from 'next';

/**
 * La página es un componente de navegador y no puede exportar metadatos, así
 * que el título y la descripción viven acá. Sin esto, esta ruta compartía el
 * título del sitio con todas las demás y Google las veía como duplicadas.
 */
export const metadata: Metadata = {
  title: 'Medios de pago',
  description: 'Pagá de forma segura con Mercado Pago Checkout Pro. Los datos de tu tarjeta se procesan fuera de Home Pádel.',
  alternates: { canonical: '/medios-de-pago' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
