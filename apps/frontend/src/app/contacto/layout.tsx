import type { Metadata } from 'next';

/**
 * La página es un componente de navegador y no puede exportar metadatos, así
 * que el título y la descripción viven acá. Sin esto, esta ruta compartía el
 * título del sitio con todas las demás y Google las veía como duplicadas.
 */
export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Escribinos por WhatsApp o dejanos tu consulta. Te asesoramos para que elijas la paleta que mejor se adapta a tu juego.',
  alternates: { canonical: '/contacto' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
