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
      settleOrder: jest.fn().mockResolvedValue(true),
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

  it('al acreditarse el pago le avisa al cliente por mail, con los productos y el monto cobrado', async () => {
    const orden = {
      id: 'o-1',
      number: 'HP-1',
      total: 1000,
      notes: JSON.stringify({ externalReference: 'ref_1', buyerEmail: 'cliente@ejemplo.com', buyerName: 'Ana', shippingCarrier: 'correo_argentino' }),
      items: [{ productId: 'p-1', quantity: 2, price: 1000, product: { name: 'Paleta' } }],
    };
    const prisma = {
      payment: { findUnique: jest.fn().mockResolvedValue(null) },
      order: { findFirst: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(orden), update: jest.fn() },
      siteSection: { findUnique: jest.fn().mockResolvedValue(null) },
    };
    const emails = { sendPaymentReceived: jest.fn().mockResolvedValue({}) };
    const service = new PaymentsSettlementService(prisma as never, {} as never, {} as never, emails as never);
    Object.assign(service, { resolveUser: jest.fn().mockResolvedValue({ id: 'user-9' }), settleOrder: jest.fn().mockResolvedValue(true) });

    await service.settle({ id: 'mp-1', status: 'approved', external_reference: 'ref_1', transaction_amount: 2000, payer: { email: 'mp@ejemplo.com' } } as never);

    expect(emails.sendPaymentReceived).toHaveBeenCalledWith('cliente@ejemplo.com', {
      orderNumber: 'HP-1', customerName: 'Ana', items: [{ name: 'Paleta', quantity: 2, price: 1000 }], total: 2000, esRetiro: false,
    });
  });

  it('si otro aviso ya registró el pago, no manda el mail otra vez', async () => {
    const orden = { id: 'o-1', number: 'HP-1', total: 1000, notes: JSON.stringify({ externalReference: 'ref_1', buyerEmail: 'c@e.com' }), items: [] };
    const prisma = {
      payment: { findUnique: jest.fn().mockResolvedValue(null) },
      order: { findFirst: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(orden), update: jest.fn() },
      siteSection: { findUnique: jest.fn().mockResolvedValue(null) },
    };
    const emails = { sendPaymentReceived: jest.fn() };
    const service = new PaymentsSettlementService(prisma as never, {} as never, {} as never, emails as never);
    Object.assign(service, { resolveUser: jest.fn().mockResolvedValue(null), settleOrder: jest.fn().mockResolvedValue(false) });

    await expect(service.settle({ id: 'mp-1', status: 'approved', external_reference: 'ref_1' } as never)).resolves.toBe('ya-estaba');
    expect(emails.sendPaymentReceived).not.toHaveBeenCalled();
  });

  it('si otro aviso ya registró el pago, no vuelve a informar la compra', async () => {
    (enviarCompraAMeta as jest.Mock).mockClear();
    const orden = { id: 'o-1', number: 'HP-1', notes: JSON.stringify({ externalReference: 'ref_1' }), items: [] };
    const prisma = {
      payment: { findUnique: jest.fn().mockResolvedValue(null) },
      order: { findFirst: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(orden), update: jest.fn() },
      siteSection: { findUnique: jest.fn().mockResolvedValue(null) },
    };
    const service = new PaymentsSettlementService(prisma as never, {} as never, {} as never);
    Object.assign(service, { resolveUser: jest.fn().mockResolvedValue(null), settleOrder: jest.fn().mockResolvedValue(false) });

    await expect(service.settle({ id: 'mp-1', status: 'approved', external_reference: 'ref_1' } as never)).resolves.toBe('ya-estaba');
    expect(enviarCompraAMeta).not.toHaveBeenCalled();
  });
});
