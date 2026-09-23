import type { Metadata } from 'next';
import { getSiteUrl } from '@/lib/siteUrl';
import ProductoContent from './ProductoContent';
import ProductJsonLd from './ProductJsonLd';
import { getProductoParaSeo } from './getProductoParaSeo';

/**
 * Ficha de producto.
 *
 * Esta parte corre en el servidor y existe solo para el buscador: arma el
 * título, la descripción y los datos estructurados con el producto real. La
 * página era enteramente del navegador, así que Google recibía un cascarón
 * vacío —las 43 fichas compartían el mismo título y el nombre del producto no
 * aparecía ni una vez en el HTML—, y ninguna podía rankear por su propio
 * nombre.
 *
 * Todo lo interactivo sigue en el navegador, en ProductoContent.
 */
export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProductoParaSeo(slug);
  const siteUrl = getSiteUrl();
  const canonical = '/producto/' + slug;

  if (!producto) {
    // Sin producto no se inventa un título: se deja el del sitio y se pide no
    // indexar, para no sumar una página vacía al buscador.
    return { alternates: { canonical }, robots: { index: false, follow: true } };
  }

  const marca = producto.brand?.name?.trim();
  const titulo = marca ? `${producto.name} — ${marca}` : producto.name;
  const descripcion =
    producto.description?.trim() ||
    `Comprá ${producto.name}${marca ? ' de ' + marca : ''} en Home Pádel. Envíos a todo el país y múltiples medios de pago.`;
  const imagen = producto.images?.[0];

  return {
    title: titulo,
    description: descripcion.slice(0, 300),
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: siteUrl + canonical,
      title: titulo,
      description: descripcion.slice(0, 300),
      images: imagen ? [{ url: imagen, alt: producto.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descripcion.slice(0, 300),
      images: imagen ? [imagen] : undefined,
    },
  };
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params;
  const producto = await getProductoParaSeo(slug);

  return (
    <>
      {producto && <ProductJsonLd producto={producto} slug={slug} />}
      <ProductoContent />
    </>
  );
}
