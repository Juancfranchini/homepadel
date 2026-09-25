import { ConflictException } from '@nestjs/common';
import { InventoryMovementType } from '@prisma/client';
import { InventoryService } from './inventory.service';

function setup(updateCount = 1) {
  const tx = {
    product: { updateMany: jest.fn().mockResolvedValue({ count: updateCount }), update: jest.fn() },
    productVariant: {
      updateMany: jest.fn().mockResolvedValue({ count: updateCount }),
      update: jest.fn(),
    },
    inventoryMovement: { create: jest.fn().mockResolvedValue({ id: 'movement-1' }) },
  };
  const prisma = { $transaction: jest.fn((callback) => callback(tx)) };
  return { service: new InventoryService(prisma as never), tx };
}

const item = { productId: 'product-1', name: 'Paleta', quantity: 1, price: 1000 };

describe('InventoryService', () => {
  it('descuenta con condición atómica y registra la salida vinculada a la venta', async () => {
    const { service, tx } = setup();
    await service.deduct([item], { orderId: 'order-1', userId: 'seller-1' });

    expect(tx.product.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ stock: { gte: 1 } }),
      }),
    );
    expect(tx.inventoryMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: 'order-1',
        quantity: -1,
        type: InventoryMovementType.SALE,
      }),
    });
  });

  it('rechaza la segunda venta cuando el update atómico no encuentra stock', async () => {
    const { service, tx } = setup(0);
    await expect(service.deduct([item], { orderId: 'order-2' })).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(tx.inventoryMovement.create).not.toHaveBeenCalled();
  });

  it('restituye stock con un movimiento compensatorio, sin borrar historial', async () => {
    const { service, tx } = setup();
    await service.restoreWithClient(tx as never, [{ ...item, quantity: 2 }], {
      orderId: 'order-1',
      type: InventoryMovementType.RETURN,
      reason: 'Devolución',
    });
    expect(tx.product.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { stock: { increment: 2 } } }),
    );
    expect(tx.inventoryMovement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ quantity: 2, type: 'RETURN' }),
    });
  });
});
