// Borra todos los pedidos que existan en la base al momento de correrlo —
// pensado para el día que la tienda pasa de pruebas a producción real.
//
// Uso:
//   npx ts-node prisma/reset-test-orders.ts               → solo muestra qué borraría (dry-run)
//   CONFIRMAR=si npx ts-node prisma/reset-test-orders.ts  → borra de verdad
//
// No toca el stock de productos ni los carritos abandonados — eso queda
// fuera a propósito, ver la conversación que originó este script.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Resumen {
  ordenes: number;
  items: number;
  pagos: number;
  envios: number;
  movimientosInventario: number;
  devoluciones: number;
  itemsDevueltos: number;
  movimientosCaja: number;
  enlacesDesvinculados: number;
  carritosDesvinculados: number;
}

async function contarRelacionados(ordenIds: string[]): Promise<Resumen> {
  const [items, pagos, envios, movimientosInventario, devoluciones, movimientosCaja, enlaces, carritos] =
    await Promise.all([
      prisma.orderItem.count({ where: { orderId: { in: ordenIds } } }),
      prisma.payment.count({ where: { orderId: { in: ordenIds } } }),
      prisma.shipment.count({ where: { orderId: { in: ordenIds } } }),
      prisma.inventoryMovement.count({ where: { orderId: { in: ordenIds } } }),
      prisma.saleReturn.count({ where: { orderId: { in: ordenIds } } }),
      prisma.cashMovement.count({ where: { orderId: { in: ordenIds } } }),
      prisma.salesCheckoutLink.count({ where: { orderId: { in: ordenIds } } }),
      prisma.savedCart.count({ where: { convertedOrderId: { in: ordenIds } } }),
    ]);

  const itemsDevueltos = await prisma.saleReturnItem.count({
    where: { orderItem: { orderId: { in: ordenIds } } },
  });

  return {
    ordenes: ordenIds.length,
    items,
    pagos,
    envios,
    movimientosInventario,
    devoluciones,
    itemsDevueltos,
    movimientosCaja,
    enlacesDesvinculados: enlaces,
    carritosDesvinculados: carritos,
  };
}

function imprimirResumen(resumen: Resumen, esDryRun: boolean) {
  const verbo = esDryRun ? 'Se borrarían' : 'Se borraron';
  console.log(`\n${verbo}:`);
  console.log(`  ${resumen.ordenes} órdenes`);
  console.log(`  ${resumen.items} ítems de pedido`);
  console.log(`  ${resumen.pagos} pagos`);
  console.log(`  ${resumen.envios} envíos`);
  console.log(`  ${resumen.movimientosInventario} movimientos de inventario (auditoría, no el stock)`);
  console.log(`  ${resumen.devoluciones} devoluciones (${resumen.itemsDevueltos} ítems devueltos)`);
  console.log(`  ${resumen.movimientosCaja} movimientos de caja`);
  console.log(`  ${resumen.enlacesDesvinculados} enlaces de venta (SalesCheckoutLink) quedan sin la orden asociada, no se borran`);
  console.log(`  ${resumen.carritosDesvinculados} carritos guardados (SavedCart) quedan sin la orden asociada, no se borran`);
}

async function imprimirOrdenes(ordenes: { number: string; status: string; total: number; createdAt: Date }[]) {
  console.log(`\nÓrdenes encontradas (${ordenes.length}):`);
  for (const o of ordenes) {
    console.log(`  ${o.number} | ${o.status} | $${o.total} | ${o.createdAt.toISOString()}`);
  }
}

/** Borra en el orden que exige el schema: hijos primero, la orden al final. */
async function borrarOrdenes(ordenIds: string[]) {
  // El límite por defecto de Prisma (5s) no alcanza: son varias consultas
  // secuenciales contra Railway, cada una con su ida y vuelta de red.
  await prisma.$transaction(async (tx) => {
    await tx.saleReturnItem.deleteMany({ where: { orderItem: { orderId: { in: ordenIds } } } });
    await tx.saleReturn.deleteMany({ where: { orderId: { in: ordenIds } } });
    await tx.cashMovement.deleteMany({ where: { orderId: { in: ordenIds } } });
    await tx.payment.deleteMany({ where: { orderId: { in: ordenIds } } });
    await tx.inventoryMovement.deleteMany({ where: { orderId: { in: ordenIds } } });
    await tx.shipment.deleteMany({ where: { orderId: { in: ordenIds } } });
    await tx.orderItem.deleteMany({ where: { orderId: { in: ordenIds } } });
    await tx.salesCheckoutLink.updateMany({ where: { orderId: { in: ordenIds } }, data: { orderId: null } });
    await tx.savedCart.updateMany({ where: { convertedOrderId: { in: ordenIds } }, data: { convertedOrderId: null } });
    await tx.order.deleteMany({ where: { id: { in: ordenIds } } });

    // Después de borrar, el uso real de cada cupón es lo que quede en pie —
    // se recalcula en vez de ponerlo en 0 a ciegas, por si ya hay algún
    // pedido real posterior al corte que también lo haya usado.
    const cupones = await tx.coupon.findMany({ select: { id: true, code: true } });
    for (const cupon of cupones) {
      const usados = await tx.order.count({ where: { couponCode: cupon.code } });
      await tx.coupon.update({ where: { id: cupon.id }, data: { usedCount: usados } });
    }
  }, { timeout: 30000, maxWait: 10000 });
}

async function main() {
  const cutoff = new Date();
  const ordenes = await prisma.order.findMany({
    where: { createdAt: { lt: cutoff } },
    select: { id: true, number: true, status: true, total: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  if (ordenes.length === 0) {
    console.log('No hay pedidos para borrar — la base ya está limpia.');
    return;
  }

  await imprimirOrdenes(ordenes);
  const ordenIds = ordenes.map((o) => o.id);
  const resumen = await contarRelacionados(ordenIds);

  const confirmado = process.env.CONFIRMAR === 'si';
  imprimirResumen(resumen, !confirmado);

  if (!confirmado) {
    console.log('\nModo dry-run: no se borró nada. Para borrar de verdad, correr con CONFIRMAR=si.');
    return;
  }

  await borrarOrdenes(ordenIds);
  console.log('\n✅ Listo. Las estadísticas de ventas arrancan en cero desde acá.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
