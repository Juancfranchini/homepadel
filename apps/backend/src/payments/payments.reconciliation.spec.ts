/**
 * Reconciliación de órdenes pendientes.
 *
 * Por qué existe: la tienda confirma el pago cuando el comprador vuelve del
 * checkout. Si cierra la pestaña y no vuelve, nadie pregunta, y esa orden
 * quedaba pendiente para siempre con el stock sin descontar.
 */

import { PaymentsReconciliationService } from './payments.reconciliation';

function construir(pendientes: { number: string }[], confirmadas: string[] = []) {
  const prisma = { order: { findMany: jest.fn().mockResolvedValue(pendientes) } };
  const payments = {
    confirmarOrden: jest.fn(async (n: string) => ({
      status: confirmadas.includes(n) ? 'PAID' : 'PENDING',
      confirmada: confirmadas.includes(n),
    })),
  };
  return { servicio: new PaymentsReconciliationService(prisma as any, payments as any), prisma, payments };
}

describe('PaymentsReconciliationService', () => {
  it('consulta cada orden pendiente en Mercado Pago', async () => {
    const { servicio, payments } = construir([{ number: 'HP-1' }, { number: 'HP-2' }]);
    const resultado = await servicio.reconciliar();

    expect(payments.confirmarOrden).toHaveBeenCalledTimes(2);
    expect(resultado.revisadas).toBe(2);
  });

  it('cuenta solo las que estaban realmente pagadas', async () => {
    const { servicio } = construir([{ number: 'HP-1' }, { number: 'HP-2' }], ['HP-2']);
    expect((await servicio.reconciliar()).confirmadas).toBe(1);
  });

  it('solo mira órdenes de Mercado Pago, pendientes y con algunos minutos', async () => {
    const { servicio, prisma } = construir([]);
    await servicio.reconciliar();

    const filtro = prisma.order.findMany.mock.calls[0][0].where;
    expect(filtro.status).toBe('PENDING');
    expect(filtro.notes.contains).toBe('externalReference');
    expect(filtro.createdAt.lte.getTime()).toBeLessThan(Date.now());
    expect(prisma.order.findMany.mock.calls[0][0].take).toBeLessThanOrEqual(40);
  });

  it('no se encima consigo misma si una pasada tarda', async () => {
    const { servicio, prisma } = construir([{ number: 'HP-1' }]);
    const primera = servicio.reconciliar();
    const segunda = await servicio.reconciliar();

    expect(segunda).toEqual({ revisadas: 0, confirmadas: 0 });
    await primera;
    expect(prisma.order.findMany).toHaveBeenCalledTimes(1);
  });

  it('un error de la base no tumba el proceso', async () => {
    const { servicio, prisma } = construir([]);
    prisma.order.findMany.mockRejectedValue(new Error('base caída'));

    await expect(servicio.reconciliar()).resolves.toEqual({ revisadas: 0, confirmadas: 0 });
  });
});
