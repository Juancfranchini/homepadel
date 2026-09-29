import { Product } from './useProductosPage';

/** Textos de relleno que quedaron de pruebas y no pueden salir en una ficha publicada. */
const RELLENO = /\b(bla\s*bla|lorem|ipsum|asdf|xxx+|(texto|producto|descripci[oó]n) de prueba)\b/i;
const DESCRIPCION_MINIMA = 40;

function tieneStock(p: Product): boolean {
  if (p.isMadeToOrder) return true;
  if (p.variants?.length) return p.variants.some((v) => v.stock > 0);
  return p.stock > 0;
}

/**
 * Lo que le falta o tiene mal a una ficha para poder pautarla: quien llega
 * desde un anuncio ve exactamente esto. Solo mira datos que ya trae el listado.
 */
export function problemasDeFicha(p: Product): string[] {
  const problemas: string[] = [];
  const descripcion = (p.description ?? '').replace(/<[^>]*>/g, ' ').trim();
  if (RELLENO.test(p.name)) problemas.push('El nombre tiene texto de prueba');
  if (!descripcion) problemas.push('Sin descripción');
  else if (RELLENO.test(descripcion)) problemas.push('La descripción tiene texto de prueba ("bla bla", "lorem"…)');
  else if (descripcion.length < DESCRIPCION_MINIMA) problemas.push('Descripción muy corta');
  if (!p.images?.length) problemas.push('Sin fotos');
  if (p.weightUnit === 'mg' || p.variants?.some((v) => v.weightUnit === 'mg')) problemas.push('Peso en mg (¿son gramos?)');
  if (p.salePrice && p.salePrice >= p.price) problemas.push('El precio promo no es menor al de lista: no se muestra');
  const vigente = p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
  if (p.transferPrice && p.transferPrice >= vigente) problemas.push('El precio por transferencia no es menor al vigente: no se muestra');
  if (!tieneStock(p)) problemas.push('Sin stock: el anuncio lleva a un producto que no se puede comprar');
  return problemas;
}
