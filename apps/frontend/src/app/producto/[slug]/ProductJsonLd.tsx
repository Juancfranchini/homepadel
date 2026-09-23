import { getSiteUrl } from '@/lib/siteUrl';
import type { ProductoSeo } from './getProductoParaSeo';

/**
 * Datos estructurados del producto para Google (schema.org/Product).
 *
 * Es lo que permite que en los resultados de búsqueda aparezcan el precio, la
 * disponibilidad y las estrellas debajo del enlace, en vez de solo el título.
 * Sin esto la ficha compite en igualdad de condiciones con cualquier página de
 * texto, y con esto se ve como lo que es: un producto a la venta.
 *
 * Solo se declara lo que está cargado de verdad. Una valoración inventada o un
 * stock que no existe son motivo de penalización de Google, además de mentirle
 * a quien busca.
 */
export default function ProductJsonLd({ producto, slug }: { producto: ProductoSeo; slug: string }) {
  const siteUrl = getSiteUrl();
  const precio = producto.effectivePrice ?? producto.price;

  // Un producto por encargo se vende sin stock: no se tiene, se trae.
  const disponibilidad = producto.isMadeToOrder
    ? 'https://schema.org/PreOrder'
    : producto.stock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

  const datos: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: producto.name,
    url: siteUrl + '/producto/' + slug,
    offers: {
      '@type': 'Offer',
      url: siteUrl + '/producto/' + slug,
      priceCurrency: 'ARS',
      price: precio,
      availability: disponibilidad,
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  if (producto.description?.trim()) datos.description = producto.description.trim();
  if (producto.sku) datos.sku = producto.sku;
  if (producto.images?.length) datos.image = producto.images;
  if (producto.brand?.name) datos.brand = { '@type': 'Brand', name: producto.brand.name.trim() };
  if (producto.category?.name) datos.category = producto.category.name;

  if (producto.reviewCount && producto.reviewCount > 0 && producto.rating) {
    datos.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: producto.rating,
      reviewCount: producto.reviewCount,
    };
  }

  return (
    <script
      type="application/ld+json"
      // El contenido lo arma el servidor con datos de la base, no del visitante.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos) }}
    />
  );
}
