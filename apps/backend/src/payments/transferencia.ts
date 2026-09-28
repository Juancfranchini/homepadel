// Transferencia bancaria en la tienda online.
//
// Doble llave: la variable ENABLE_BANK_TRANSFER (Railway) y el interruptor del
// backoffice (site-sections / payment_methods → transferencia.active). Sin las
// dos, no se muestra ni se aceptan pedidos.
//
// Los datos de la cuenta (CBU, alias, titular, banco) no se sirven en la
// configuración pública: se le entregan solo a quien acaba de hacer un pedido
// por transferencia, en la respuesta de ese pedido.

import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DatosTransferencia {
  alias: string | null;
  cbu: string | null;
  titular: string | null;
  banco: string | null;
}

interface ConfigTransferencia {
  active?: boolean;
  alias?: string;
  cbu?: string;
  titular?: string;
  banco?: string;
  logo?: string;
}

/** Pedidos por transferencia sin pagar que puede tener abiertos un cliente a la vez. */
export const MAX_TRANSFERENCIAS_PENDIENTES = 2;
const VENTANA_PENDIENTES_MS = 72 * 60 * 60 * 1000;

const configDe = (data: unknown): ConfigTransferencia =>
  ((data as { transferencia?: ConfigTransferencia } | null)?.transferencia ?? {});

export function transferenciaHabilitada(data: unknown): boolean {
  return process.env.ENABLE_BANK_TRANSFER === 'true' && configDe(data).active === true;
}

/**
 * Versión pública de los medios de pago: la transferencia dice si está
 * disponible de verdad (las dos llaves) y no lleva los datos de la cuenta.
 */
export function mediosDePagoPublicos<T extends { data?: unknown }>(section: T): T {
  if (!section?.data || typeof section.data !== 'object') return section;
  const { active: _active, alias: _alias, cbu: _cbu, titular: _titular, banco: _banco, ...resto } = configDe(section.data);
  return {
    ...section,
    data: { ...(section.data as object), transferencia: { ...resto, active: transferenciaHabilitada(section.data) } },
  };
}

/**
 * Antes de tomar un pedido por transferencia: que esté habilitada y que el
 * cliente no tenga ya varios sin pagar (cada uno descuenta stock al crearse;
 * sin tope, alguien podría dejar productos bloqueados con pedidos que nunca paga).
 * Devuelve los datos para transferir.
 */
export async function exigirTransferencia(prisma: PrismaService, userId?: string): Promise<DatosTransferencia> {
  const section = await prisma.siteSection.findUnique({ where: { key: 'payment_methods' } });
  if (!transferenciaHabilitada(section?.data)) {
    throw new BadRequestException('La transferencia bancaria no está habilitada. Usá Mercado Pago.');
  }
  if (userId) {
    const pendientes = await prisma.order.count({
      where: {
        userId,
        status: 'PENDING',
        createdAt: { gte: new Date(Date.now() - VENTANA_PENDIENTES_MS) },
        notes: { contains: '"paymentMethod":"transfer"' },
      },
    });
    if (pendientes >= MAX_TRANSFERENCIAS_PENDIENTES) {
      throw new BadRequestException(
        'Ya tenés pedidos por transferencia esperando el pago. Terminá esos o escribinos por WhatsApp para hacer uno nuevo.',
      );
    }
  }
  const c = configDe(section?.data);
  return { alias: c.alias || null, cbu: c.cbu || null, titular: c.titular || null, banco: c.banco || null };
}
