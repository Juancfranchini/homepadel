import type { Metadata } from 'next';

/**
 * El contenido lo arma un componente de navegador (LegalPage), así que los
 * metadatos viven acá. Antes heredaba el canonical de la portada (Google la
 * tomaba como un duplicado) y el título genérico del sitio.
 */
export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Cómo Home Pádel recopila, usa y protege tus datos personales cuando comprás en la tienda.',
  alternates: { canonical: '/privacidad' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
