import { PaymentsSettlementService } from './payments-settlement.service';

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
      service.settle({ id: 'mp-123', status: 'approved' }, 'https://homepadel.store'),
    ).resolves.toBe('ya-estaba');
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(inventory.deductWithClient).not.toHaveBeenCalled();
    expect(abandonedCarts.markRecovered).not.toHaveBeenCalled();
  });
});
