import { BadRequestException, ConflictException } from '@nestjs/common';
import { PaymentKind, PaymentMethod, PaymentStatus } from '@prisma/client';
import { PosPaymentsService } from './pos-payments.service';

function transaction(open = true) {
  let number = 0;
  return {
    payment: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation(() => Promise.resolve({ id: `payment-${++number}` })),
    },
    cashSession: { findFirst: jest.fn().mockResolvedValue(open ? { id: 'cash-1' } : null) },
    cashMovement: { create: jest.fn().mockResolvedValue({ id: 'move-1' }) },
  };
}

describe('PosPaymentsService', () => {
  const service = new PosPaymentsService();

  it('registra dos medios, pero sólo el efectivo como movimiento físico de caja', async () => {
    const tx = transaction();
    const result = await service.recordWithClient(
      tx as never,
      { id: 'order-1', total: 1000 },
      [
        { method: PaymentMethod.CASH, amount: 600 },
        { method: PaymentMethod.CARD, amount: 400, reference: 'cupón-123' },
      ],
      'seller-1',
      'cash-1',
    );

    expect(result).toEqual({ paid: 1000, status: PaymentStatus.PAID });
    expect(tx.payment.create).toHaveBeenCalledTimes(2);
    expect(tx.cashMovement.create).toHaveBeenCalledTimes(1);
  });

  it('no infla ingresos: un cobro parcial deja la venta parcial', async () => {
    const tx = transaction();
    await expect(
      service.recordWithClient(
        tx as never,
        { id: 'order-1', total: 1000 },
        [{ method: PaymentMethod.TRANSFER, amount: 300 }],
        'seller-1',
      ),
    ).resolves.toEqual({ paid: 300, status: PaymentStatus.PARTIAL });
  });

  it('exige una caja abierta para efectivo', async () => {
    const tx = transaction(false);
    await expect(
      service.recordWithClient(
        tx as never,
        { id: 'order-1', total: 1000 },
        [{ method: PaymentMethod.CASH, amount: 1000 }],
        'seller-1',
        'cash-closed',
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('un registro manual nunca simula Mercado Pago', async () => {
    const tx = transaction();
    await expect(
      service.recordWithClient(
        tx as never,
        { id: 'order-1', total: 1000 },
        [{ method: PaymentMethod.MERCADOPAGO, amount: 1000 }],
        'seller-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('sólo registra un reintegro de Mercado Pago con referencia externa', async () => {
    const tx = transaction();
    tx.payment.findMany.mockResolvedValue([{ amount: 1000, kind: PaymentKind.CHARGE }] as never);
    await expect(
      service.refundWithClient(
        tx as never,
        { id: 'order-1', total: 1000 },
        1000,
        PaymentMethod.MERCADOPAGO,
        'seller-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    await service.refundWithClient(
      tx as never,
      { id: 'order-1', total: 1000 },
      1000,
      PaymentMethod.MERCADOPAGO,
      'seller-1',
      'refund-mp-123',
    );
    expect(tx.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        method: PaymentMethod.MERCADOPAGO,
        kind: PaymentKind.REFUND,
        reference: 'refund-mp-123',
      }),
    });
    expect(tx.cashMovement.create).not.toHaveBeenCalled();
  });
});
