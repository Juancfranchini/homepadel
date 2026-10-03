/**
 * Feed de productos para el catálogo de Meta (Advantage+ catálogo / anuncios
 * dinámicos), en el formato CSV que acepta "Fuente de datos" en el
 * Administrador de ventas de Meta.
 *
 * El `id` es el mismo `product.id` que va en `content_ids` de ViewContent,
 * AddToCart, InitiateCheckout y Purchase: si no coinciden, Meta no puede unir
 * un evento con su producto y los anuncios dinámicos no funcionan.
 *
 * Solo funciones puras: el controlador trae los productos y esto arma el texto.
 */

export interface ProductoParaFeed {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  stock: number;
  isMadeToOrder: boolean;
  images: string[];
  brand: { name: string } | null;
  category: { name: string } | null;
  variants: { stock: number; active: boolean; isDefault: boolean }[];
}

export const COLUMNAS = [
  'id',
  'title',
  'description',
  'availability',
  'condition',
  'price',
  'sale_price',
  'link',
  'image_link',
  'additional_image_link',
  'brand',
  'product_type',
] as const;

/** Meta corta el título en 200 y la descripción en 9999; se deja margen. */
const MAX_TITULO = 150;
const MAX_DESCRIPCION = 5000;

/** Precio con el formato que exige Meta: "520000.00 ARS". */
const precio = (monto: number) => monto.toFixed(2) + ' ARS';

/** Texto plano en una línea: sin HTML ni saltos, que rompen el CSV en algunos lectores. */
export function textoPlano(texto: string): string {
  return texto
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Campo CSV según RFC 4180: entre comillas si hace falta, con las comillas duplicadas. */
export function campoCsv(valor: string): string {
  return /[",\n\r]/.test(valor) ? '"' + valor.replace(/"/g, '""') + '"' : valor;
}

/**
 * Disponibilidad con los valores que acepta Meta. Con variantes (talles,
 * colores) el stock real está en ellas; el del producto puede quedar en 0.
 */
export function disponibilidad(p: ProductoParaFeed): 'in stock' | 'out of stock' | 'available for order' {
  if (p.isMadeToOrder) return 'available for order';
  const variantes = p.variants.filter((v) => v.active && !v.isDefault);
  const stock = variantes.length > 0 ? variantes.reduce((acc, v) => acc + v.stock, 0) : p.stock;
  return stock > 0 ? 'in stock' : 'out of stock';
}

/** Imagen absoluta: Meta no acepta rutas relativas. */
function urlAbsoluta(imagen: string, backendUrl: string): string {
  return /^https?:\/\//.test(imagen) ? imagen : backendUrl + (imagen.startsWith('/') ? '' : '/') + imagen;
}

/**
 * Una fila por producto. Devuelve null si al producto le falta algo que Meta
 * exige (imagen o precio): mejor afuera del feed que rechazado en Meta, donde
 * el error no lo ve nadie.
 */
export function filaDelFeed(p: ProductoParaFeed, sitio: string, backendUrl: string): string[] | null {
  const imagenes = p.images.filter(Boolean).map((i) => urlAbsoluta(i, backendUrl));
  if (imagenes.length === 0 || !(p.price > 0)) return null;

  const titulo = textoPlano(p.name).slice(0, MAX_TITULO);
  // Meta exige descripción: sin una cargada, va el nombre con la marca.
  const descripcion = textoPlano(p.description || '') || [titulo, textoPlano(p.brand?.name ?? '')].filter(Boolean).join(' — ');
  const enOferta = p.salePrice != null && p.salePrice > 0 && p.salePrice < p.price;

  return [
    p.id,
    titulo,
    descripcion.slice(0, MAX_DESCRIPCION),
    disponibilidad(p),
    'new',
    precio(p.price),
    enOferta ? precio(p.salePrice as number) : '',
    sitio + '/producto/' + p.slug,
    imagenes[0],
    // Meta acepta hasta 20 imágenes extra, separadas por coma dentro del campo.
    imagenes.slice(1, 21).join(','),
    textoPlano(p.brand?.name ?? ''),
    textoPlano(p.category?.name ?? ''),
  ];
}

export function armarFeedCsv(productos: ProductoParaFeed[], sitio: string, backendUrl: string): string {
  const filas = productos
    .map((p) => filaDelFeed(p, sitio, backendUrl))
    .filter((f): f is string[] => f !== null)
    .map((f) => f.map(campoCsv).join(','));
  return [COLUMNAS.join(','), ...filas].join('\n') + '\n';
}
