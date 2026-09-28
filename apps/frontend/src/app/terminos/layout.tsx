import type { Metadata } from 'next';

/**
 * El contenido lo arma un componente de navegador (LegalPage), así que los
 * metadatos viven acá. Antes heredaba el canonical de la portada (Google la
 * tomaba como un duplicado) y el título genérico del sitio.
 */
export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description: 'Términos y condiciones de compra en Home Pádel: pedidos, pagos, envíos, cambios y devoluciones.',
  alternates: { canonical: '/terminos' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
