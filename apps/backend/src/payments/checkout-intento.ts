import * as crypto from 'crypto';
import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Reintentos del pago con Mercado Pago sin duplicar pedidos.
 *
 * Cada vez que alguien tocaba "Ir a Mercado Pago" se creaba un pedido
 * pendiente y una preferencia nuevos: volver del pago rechazado y reintentar,
 * o volver atrás desde Mercado Pago y tocar de nuevo, dejaba pedidos
 * duplicados. Ahora la tienda manda un `checkoutId` fijo por intento de
 * compra: si ya hay un pedido pendiente con ese id y el mismo contenido, se
 * reusa su preferencia; si ya está pagado, no se deja pagar otra vez.
 */

/** Estados en que el pedido ya está cobrado. */
export const ESTADOS_COBRADOS = ['PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED'];

/** Hasta cuándo se reusa un intento: pasado esto se arma uno nuevo. */
const VIGENCIA_MS = 24 * 60 * 60 * 1000;

export interface IntentoPrevio {
  orderNumber: string;
  status: string;
  firma?: string;
  preferenceId?: string;
  initPoint?: string;
}

/**
 * Huella del contenido del pedido: si cambió algo (productos, precios, envío,
 * cupón, domicilio o comprador) ya no es el mismo pedido y no se reusa.
 */
export function firmaDelIntento(contenido: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(contenido)).digest('hex').slice(0, 32);
}

export async function buscarIntento(
  prisma: Pick<PrismaService, 'order'>,
  checkoutId: string,
): Promise<IntentoPrevio | null> {
  const orden = await prisma.order.findFirst({
    where: {
      notes: { contains: `"checkoutId":"${checkoutId}"` },
      createdAt: { gte: new Date(Date.now() - VIGENCIA_MS) },
    },
    orderBy: { createdAt: 'desc' },
    select: { number: true, status: true, notes: true },
  });
  if (!orden) return null;
  let notas: Record<string, unknown> = {};
  try {
    notas = orden.notes ? JSON.parse(orden.notes) : {};
  } catch {
    notas = {};
  }
  const texto = (v: unknown) => (typeof v === 'string' ? v : undefined);
  return {
    orderNumber: orden.number,
    status: orden.status,
    firma: texto(notas.firmaCheckout),
    preferenceId: texto(notas.preferenceId),
    initPoint: texto(notas.initPoint),
  };
}

/** Deja en el pedido los datos para poder reusarlo. */
export async function guardarIntento(
  prisma: Pick<PrismaService, 'order'>,
  orderNumber: string,
  datos: { checkoutId?: string; firmaCheckout: string; preferenceId: string; initPoint: string },
): Promise<void> {
  const orden = await prisma.order.findUnique({ where: { number: orderNumber }, select: { notes: true } });
  let notas: Record<string, unknown> = {};
  try {
    notas = orden?.notes ? JSON.parse(orden.notes) : {};
  } catch {
    notas = {};
  }
  await prisma.order.update({ where: { number: orderNumber }, data: { notes: JSON.stringify({ ...notas, ...datos }) } });
}

/**
 * Qué hacer con un intento que ya existía:
 *  - ya cobrado → 409 con el número, para que la tienda muestre el pedido y no cobre dos veces;
 *  - pendiente con el mismo contenido → la misma preferencia de Mercado Pago;
 *  - si no, null: se arma un pedido nuevo.
 */
export async function intentoReutilizable(
  prisma: Pick<PrismaService, 'order'>,
  checkoutId: string | undefined,
  firma: string,
): Promise<{ id?: string; init_point: string; orderNumber: string } | null> {
  if (!checkoutId) return null;
  const previo = await buscarIntento(prisma, checkoutId);
  if (!previo) return null;
  if (ESTADOS_COBRADOS.includes(previo.status)) {
    throw new ConflictException({
      statusCode: 409,
      message: 'Este pedido ya está pago: no hace falta volver a pagar.',
      yaPagado: true,
      orderNumber: previo.orderNumber,
    });
  }
  if (previo.status === 'PENDING' && previo.firma === firma && previo.initPoint) {
    return { id: previo.preferenceId, init_point: previo.initPoint, orderNumber: previo.orderNumber };
  }
  return null;
}
