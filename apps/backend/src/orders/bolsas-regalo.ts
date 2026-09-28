// Bolsa de regalo Home Pádel: sin cargo, como máximo una por unidad comprada.
// El navegador pide cuántas quiere; el servidor decide cuántas van.

/** Tope del DTO: nadie arma un pedido con más bolsas que esto. */
export const MAX_BOLSAS_REGALO = 50;

/** Bolsas que van en el pedido: entero entre 0 y las unidades compradas. */
export function bolsasDeRegalo(pedidas: number | undefined, items: { quantity: number }[]): number {
  const unidades = items.reduce((acc, item) => acc + item.quantity, 0);
  const n = Math.floor(Number(pedidas) || 0);
  return Math.max(0, Math.min(n, unidades));
}
