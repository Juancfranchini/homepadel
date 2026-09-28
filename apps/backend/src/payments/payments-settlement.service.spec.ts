import { PaymentsSettlementService } from './payments-settlement.service';
import { enviarCompraAMeta } from './payments.meta';

jest.mock('./payments.meta', () => ({ enviarCompraAMeta: jest.fn() }));

describe('PaymentsSettlementService', () => {
  it('es idempotente: un payment confirmado no vuelve a tocar orden ni inventario', async () => {
    const prisma = {
      payment: { findUnique: jest.fn().mockResolvedValue({ status: 'CONFIRMED' }) },
      order: { findFirst: jest.fn().mockResolvedValue(null) },
      $transaction: jest.fn(),
    };
    const inventory = { deductWithClient: jest.fn() };
    const abandonedCarts = { markRecovered: jest.fn() };
    const service = new PaymentsSettlementService(
      prisma as never,
      inventory as never,
      abandonedCarts as never,
    );

    await expect(
      service.settle({ id: 'mp-123', status: 'approved' }),
    ).resolves.toBe('ya-estaba');
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(inventory.deductWithClient).not.toHaveBeenCalled();
    expect(abandonedCarts.markRecovered).not.toHaveBeenCalled();
  });

  it('al acreditarse informa la compra con los datos del navegador guardados en el pedido', async () => {
    const metaCliente = { origen: 'https://www.homepadel.com.ar', ip: '190.5.6.7', userAgent: 'Safari', fbp: 'fb.1.1.222' };
    const orden = {
      id: 'o-1',
      number: 'HP-1',
      notes: JSON.stringify({ externalReference: 'ref_1', buyerEmail: 'cliente@ejemplo.com', buyerPhone: '1140832310', metaCliente }),
      items: [{ productId: 'p-1', quantity: 2, price: 1000 }],
    };
    const prisma = {
      payment: { findUnique: jest.fn().mockResolvedValue(null) },
      order: { findFirst: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(orden), update: jest.fn() },
      siteSection: { findUnique: jest.fn().mockResolvedValue(null) },
    };
    const service = new PaymentsSettlementService(prisma as never, {} as never, {} as never);
    Object.assign(service, {
      resolveUser: jest.fn().mockResolvedValue({ id: 'user-9' }),
      settleOrder: jest.fn().mockResolvedValue(undefined),
    });

    await service.settle({ id: 'mp-1', status: 'approved', external_reference: 'ref_1', transaction_amount: 2000, payer: { email: 'mp@ejemplo.com' } } as never);

    expect(enviarCompraAMeta).toHaveBeenCalledWith(prisma, expect.objectContaining({
      orderNumber: 'HP-1',
      valor: 2000,
      emails: ['cliente@ejemplo.com', 'mp@ejemplo.com'],
      telefono: '1140832310',
      cliente: metaCliente,
      userId: 'user-9',
    }));
  });
});
