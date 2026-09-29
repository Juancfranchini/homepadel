/**
 * Cuotas sin interés con Mercado Pago según el monto de la compra, editables
 * en el backoffice (Configuración → Cuotas, `site_sections` / `cuotas`).
 *
 * Cada tramo dice "desde tal monto, hasta N cuotas". Por debajo del primer
 * tramo rige `cuotasBase`. El servidor le pone ese tope a la preferencia de
 * Mercado Pago (`payment_methods.installments`) y la tienda muestra lo mismo
 * en la ficha, el carrito y el checkout. Que esas cuotas sean "sin interés"
 * se define en la cuenta de Mercado Pago: ahí tienen que estar activos esos
 * planes.
 *
 * Mientras no se active en el backoffice no cambia nada: cada producto
 * muestra sus cuotas y Mercado Pago ofrece las de la cuenta.
 */

export interface TramoCuotas {
  /** Monto desde el que rige (productos, después de descuentos; sin envío). */
  desde: number;
  cuotas: number;
}

export interface ConfigCuotas {
  activo: boolean;
  tramos: TramoCuotas[];
  /** Cuotas para compras menores al primer tramo. 1 = un solo pago. */
  cuotasBase: number;
}

/** Lo que propuso el negocio: desde $300.000, 9 cuotas; desde $400.000, 12. Inactivo hasta guardarlo. */
export const CUOTAS_POR_DEFECTO: ConfigCuotas = {
  activo: false,
  tramos: [
    { desde: 300000, cuotas: 9 },
    { desde: 400000, cuotas: 12 },
  ],
  cuotasBase: 1,
};

const entero = (v: unknown, min: number, max: number): number | null => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};

/** Lo guardado en el backoffice, saneado y ordenado de menor a mayor monto. */
export function configCuotas(guardado: unknown): ConfigCuotas {
  const g = (guardado ?? {}) as { activo?: unknown; tramos?: unknown; cuotasBase?: unknown };
  if (g.activo === undefined && g.tramos === undefined) return CUOTAS_POR_DEFECTO;
  const tramos = (Array.isArray(g.tramos) ? g.tramos : [])
    .map((t) => {
      const tramo = (t ?? {}) as { desde?: unknown; cuotas?: unknown };
      const desde = Number(tramo.desde);
      const cuotas = entero(tramo.cuotas, 1, 24);
      return Number.isFinite(desde) && desde >= 0 && cuotas ? { desde, cuotas } : null;
    })
    .filter((t): t is TramoCuotas => t !== null)
    .sort((a, b) => a.desde - b.desde);
  return { activo: g.activo === true, tramos, cuotasBase: entero(g.cuotasBase, 1, 24) ?? 1 };
}

/** Máximo de cuotas para ese monto: el tramo más alto alcanzado, o las cuotas base. */
export function cuotasPara(monto: number, config: ConfigCuotas): number {
  let cuotas = config.cuotasBase;
  for (const tramo of config.tramos) if (monto >= tramo.desde) cuotas = tramo.cuotas;
  return cuotas;
}

/** Tope de cuotas para la preferencia de Mercado Pago; vacío si las cuotas por monto no están activas. */
export async function topeDeCuotas(
  prisma: { siteSection: { findUnique: (args: { where: { key: string } }) => Promise<{ data: unknown } | null> } },
  monto: number,
): Promise<{ payment_methods?: { installments: number } }> {
  const seccion = await prisma.siteSection.findUnique({ where: { key: 'cuotas' } });
  const config = configCuotas(seccion?.data);
  return config.activo ? { payment_methods: { installments: cuotasPara(monto, config) } } : {};
}
