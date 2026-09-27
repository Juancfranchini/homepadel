/**
 * Traducción de las URLs viejas de Tiendanube a las de esta tienda.
 *
 * Google sigue teniendo indexadas las direcciones de la tienda anterior
 * (/productos/<handle>/ y /<categoria>/<marca>/) y hoy devuelven 404: se
 * pierde el posicionamiento que tenían y el que entra desde el buscador se
 * encuentra con una página rota. Con una redirección permanente Google pasa
 * ese posicionamiento a la URL nueva.
 *
 * Todo lo de acá es puro (sin fetch ni Next) para poder testearlo aparte; las
 * consultas a la API las inyecta el middleware.
 */

/**
 * Categorías de la tienda que también existían como /<categoria>/ en
 * Tiendanube. Lista fija a propósito: el `matcher` del middleware tiene que
 * ser constante, y si se agrega una categoría hay que sumarla en los dos.
 */
export const LEGACY_CATEGORY_SLUGS = ['paletas', 'accesorios', 'indumentaria', 'zapatillas', 'bolsos'] as const;

/**
 * Palabras que no distinguen un producto de otro: Tiendanube las ponía en el
 * handle ("paleta-nox-…") pero los slugs nuevos no, o viceversa ("Royal
 * Pádel"). Se ignoran al comparar.
 */
const STOPWORDS = new Set([
  'paleta', 'paletas', 'pala', 'palas', 'padel',
  'de', 'del', 'la', 'el', 'los', 'las', 'y', 'con', 'para', 'en',
]);

/** Tope de palabras del buscador del backend (MAXIMO_PALABRAS en products.search.ts). */
const MAX_SEARCH_WORDS = 6;

export type LegacyRoute =
  | { kind: 'fixed'; destination: string }
  | { kind: 'product'; words: string[] }
  | { kind: 'category'; category: string; brandSegment: string | null };

export interface ProductCandidate {
  slug: string;
  name: string;
  brand?: { slug: string; name: string } | null;
}

export interface BrandCandidate {
  slug: string;
  name: string;
}

/** Lo que el middleware tiene que traer de la API para resolver una ruta. */
export interface LegacyLookups {
  searchProducts: (query: string) => Promise<ProductCandidate[]>;
  /** Marcas de esa categoría; null si no se pudo consultar. */
  brandsOfCategory: (category: string) => Promise<BrandCandidate[] | null>;
}

/** Minúsculas, sin tildes y partido en palabras alfanuméricas. */
export function tokenize(text: string): string[] {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function significant(tokens: string[]): string[] {
  return tokens.filter((t) => !STOPWORDS.has(t));
}

/**
 * Sufijo que Tiendanube agregaba a algunos handles para desambiguar
 * ("…-europe-master-pro-14cg7", "…-hack-04-2026-9l2i6"): 5 caracteres que
 * mezclan letras y números. Se exige la mezcla para no comerse una palabra
 * real del modelo ("vento", "2025"); un sufijo sin números se escapa, pero
 * en ese caso lo peor que pasa es caer en el buscador en vez del producto.
 */
function isTiendanubeSuffix(token: string): boolean {
  return /^[a-z0-9]{5}$/.test(token) && /[a-z]/.test(token) && /\d/.test(token);
}

/** Palabras del handle de Tiendanube, sin el sufijo aleatorio. */
export function cleanHandle(handle: string): string[] {
  const tokens = tokenize(handle);
  if (tokens.length > 1 && isTiendanubeSuffix(tokens[tokens.length - 1])) tokens.pop();
  return tokens;
}

function safeDecode(pathname: string): string {
  try {
    return decodeURIComponent(pathname);
  } catch {
    // Un %XX mal formado no puede cortar la request: se sigue con el texto crudo.
    return pathname;
  }
}

/**
 * Qué es una ruta vieja, o null si no es una ruta de Tiendanube conocida (el
 * middleware la deja pasar sin tocar). Tolera barra final y mayúsculas.
 */
export function parseLegacyPath(pathname: string): LegacyRoute | null {
  const segments = safeDecode(pathname).toLowerCase().split('/').filter(Boolean);
  const [first, second] = segments;
  if (!first) return null;

  if (first === 'productos') {
    if (segments.length === 1) return { kind: 'fixed', destination: '/catalogo' };
    if (segments.length !== 2) return null;
    const words = cleanHandle(second);
    return words.length > 0 ? { kind: 'product', words } : { kind: 'fixed', destination: '/catalogo' };
  }

  if ((LEGACY_CATEGORY_SLUGS as readonly string[]).includes(first)) {
    // Tiendanube anidaba subcategorías (/paletas/nox/…): alcanza con la
    // primera, que en esta tienda era siempre la marca.
    return { kind: 'category', category: first, brandSegment: second ?? null };
  }

  return null;
}

function sameWords(a: string[], b: string[]): boolean {
  const setA = new Set(significant(a));
  const setB = new Set(significant(b));
  return setA.size > 0 && setA.size === setB.size && [...setA].every((t) => setB.has(t));
}

/**
 * El producto que corresponde sin lugar a dudas al handle viejo, o null.
 *
 * Coincide si las palabras del handle son exactamente las del producto (su
 * slug o su nombre), permitiendo que el handle agregue o no la marca. No
 * alcanza con que "contenga" las palabras: "nox-at10-luxury-genius-18k-alum"
 * contiene a las versiones 2024, 2025 y 2026, y mandar a una que no es sería
 * peor que mandar al buscador. Si coincide más de uno, también null.
 */
export function pickProductMatch(words: string[], candidates: ProductCandidate[]): string | null {
  const wanted = new Set(significant(words));
  if (wanted.size === 0) return null;

  const matches = new Set<string>();
  for (const product of candidates) {
    const brandTokens = product.brand ? [...tokenize(product.brand.slug), ...tokenize(product.brand.name)] : [];
    const matchesSome = [tokenize(product.slug), tokenize(product.name)].some((own) => {
      const ownSig = significant(own);
      const ownSet = new Set([...ownSig, ...brandTokens]);
      return ownSig.every((t) => wanted.has(t)) && [...wanted].every((t) => ownSet.has(t));
    });
    if (matchesSome) matches.add(product.slug);
  }
  return matches.size === 1 ? [...matches][0] : null;
}

/** Slug de la marca que corresponde al segmento viejo ("royal" → "royal-padel"), o null. */
export function pickBrandMatch(segment: string, brands: BrandCandidate[]): string | null {
  const segmentTokens = tokenize(segment);
  const matches = brands.filter(
    (b) => sameWords(segmentTokens, tokenize(b.slug)) || sameWords(segmentTokens, tokenize(b.name)),
  );
  return matches.length === 1 ? matches[0].slug : null;
}

/** Texto para el buscador del catálogo: sin relleno y con el tope del backend. */
export function searchText(words: string[]): string {
  const useful = significant(words);
  return (useful.length > 0 ? useful : words).slice(0, MAX_SEARCH_WORDS).join(' ');
}

export function catalogUrl(params: Record<string, string>): string {
  const query = new URLSearchParams(params).toString();
  return query ? '/catalogo?' + query : '/catalogo';
}

/**
 * URL nueva (ruta + query) a la que redirigir. Si la API falla se degrada a
 * la opción más segura: el buscador o la categoría sin marca, nunca un 500.
 */
export async function resolveLegacyDestination(route: LegacyRoute, lookups: LegacyLookups): Promise<string> {
  if (route.kind === 'fixed') return route.destination;

  if (route.kind === 'product') {
    const q = searchText(route.words);
    const candidates = await lookups.searchProducts(q).catch(() => []);
    const slug = pickProductMatch(route.words, candidates);
    return slug ? '/producto/' + encodeURIComponent(slug) : catalogUrl({ q });
  }

  if (!route.brandSegment) return catalogUrl({ categoria: route.category });
  const brands = await lookups.brandsOfCategory(route.category).catch(() => null);
  const brand = brands ? pickBrandMatch(route.brandSegment, brands) : null;
  return catalogUrl(brand ? { categoria: route.category, marca: brand } : { categoria: route.category });
}
