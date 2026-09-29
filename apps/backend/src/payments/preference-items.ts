import { ResolvedItem } from '../pricing/pricing.service';

export interface ItemPreferencia {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: 'ARS';
}

const centavos = (n: number) => Math.round(n * 100);

/**
 * Ítems de la preferencia de Mercado Pago con el descuento del cupón ya
 * repartido entre los productos, en proporción a lo que pesa cada uno.
 *
 * Antes el cupón viajaba como un ítem aparte con precio negativo, algo que
 * Mercado Pago no acepta en los ítems: una compra con cupón podía no llegar a
 * iniciarse. El total queda exacto al centavo: si una línea con varias
 * unidades no divide justo, la diferencia va en una unidad aparte.
 */
export function itemsDePreferencia(items: ResolvedItem[], descuento: number, cupon?: string): ItemPreferencia[] {
  const titulo = (item: ResolvedItem) => item.name + (item.variantId ? ' - variante ' + item.variantId : '');
  const base = (item: ResolvedItem, quantity: number, unit_price: number): ItemPreferencia => ({
    id: item.productId,
    title: titulo(item) + (descuento > 0 && cupon ? ` (cupón ${cupon})` : ''),
    quantity,
    unit_price,
    currency_id: 'ARS',
  });
  if (!(descuento > 0)) return items.map((item) => base(item, item.quantity, item.price));

  const totalC = items.reduce((acc, i) => acc + centavos(i.price) * i.quantity, 0);
  let restanteC = Math.min(centavos(descuento), totalC);
  return items.flatMap((item, idx) => {
    const lineaC = centavos(item.price) * item.quantity;
    const parteC = idx === items.length - 1 ? restanteC : Math.min(restanteC, Math.round((centavos(descuento) * lineaC) / totalC));
    restanteC -= parteC;
    const finalC = lineaC - parteC;
    const unidadC = Math.floor(finalC / item.quantity);
    const sobraC = finalC - unidadC * item.quantity;
    if (sobraC === 0) return [base(item, item.quantity, unidadC / 100)];
    const partes = [base(item, 1, (unidadC + sobraC) / 100)];
    if (item.quantity > 1) partes.unshift(base(item, item.quantity - 1, unidadC / 100));
    return partes;
  });
}
