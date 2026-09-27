import { Prisma } from '@prisma/client';

/**
 * Filtro de rango sobre el precio que ve el cliente, no el de lista.
 *
 * El filtro viejo comparaba contra `price`: una paleta de $500.000 en oferta
 * a $400.000 no aparecía buscando "hasta $450.000". Replica la regla de
 * `effectivePrice` (pricing/effective-price.ts): vale la oferta solo si es
 * mayor a 0 y menor al precio de lista.
 *
 * El caso "sin oferta válida" se escribe con OR explícitos y no con NOT: en
 * SQL, NOT sobre un `salePrice` nulo da nulo y dejaría afuera justo los
 * productos sin oferta.
 */
export function precioEfectivoEnRango(
  priceField: Prisma.FieldRef<'Product', 'Float'>,
  min?: number,
  max?: number,
): Prisma.ProductWhereInput | null {
  const rango: Prisma.FloatFilter<'Product'> = {};
  if (min != null && Number.isFinite(min)) rango.gte = min;
  if (max != null && Number.isFinite(max)) rango.lte = max;
  if (rango.gte == null && rango.lte == null) return null;

  return {
    OR: [
      { AND: [{ salePrice: { gt: 0, lt: priceField } }, { salePrice: rango }] },
      {
        AND: [
          { OR: [{ salePrice: null }, { salePrice: { lte: 0 } }, { salePrice: { gte: priceField } }] },
          { price: rango },
        ],
      },
    ],
  };
}
