import { Prisma } from '@prisma/client';

/**
 * Filtro para encontrar la orden que ya tiene registrado ese pago de Mercado
 * Pago en `notes.paymentId` (las ventas registradas antes de que existiera la
 * tabla de pagos).
 *
 * Antes se buscaba el número del pago en cualquier parte de las notas: un
 * número que aparecía dentro de otro dato (el id de una preferencia, la marca
 * de tiempo de las cookies del Pixel) hacía creer que el pago ya estaba
 * registrado, y un pago aprobado de verdad se ignoraba. Ahora tiene que ser
 * exactamente el campo `paymentId`, guardado como número o como texto.
 */
export function filtroOrdenConPago(paymentId: string | number): Prisma.OrderWhereInput {
  const id = String(paymentId);
  return {
    OR: [`"paymentId":${id},`, `"paymentId":${id}}`, `"paymentId":"${id}"`].map((patron) => ({ notes: { contains: patron } })),
  };
}
