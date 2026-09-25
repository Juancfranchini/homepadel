import { ConflictException, Injectable } from '@nestjs/common';
import { InventoryMovementType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ResolvedItem } from '../pricing/pricing.service';

export interface InventoryContext {
  orderId?: string;
  branchId?: string;
  userId?: string;
  type?: InventoryMovementType;
  reason?: string;
}

interface RestockItem {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async deduct(items: ResolvedItem[], context: InventoryContext = {}): Promise<void> {
    await this.prisma.$transaction((tx) => this.deductWithClient(tx, items, context));
  }

  async deductWithClient(
    tx: Prisma.TransactionClient,
    items: ResolvedItem[],
    context: InventoryContext = {},
  ): Promise<void> {
    for (const item of items) {
      if (item.isMadeToOrder) continue;
      const result = item.variantId
        ? await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              productId: item.productId,
              stock: { gte: item.quantity },
              active: true,
            },
            data: { stock: { decrement: item.quantity } },
          })
        : await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity }, active: true },
            data: { stock: { decrement: item.quantity } },
          });

      if (result.count === 0) {
        throw new ConflictException(`Sin stock suficiente de "${item.name}"`);
      }
      if (context.orderId) await this.recordMovement(tx, item, -item.quantity, context);
    }
  }

  async restoreWithClient(
    tx: Prisma.TransactionClient,
    items: RestockItem[],
    context: InventoryContext,
  ): Promise<void> {
    for (const item of items) {
      if (item.variantId) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      await this.recordMovement(tx, item, item.quantity, context);
    }
  }

  private recordMovement(
    tx: Prisma.TransactionClient,
    item: RestockItem,
    quantity: number,
    context: InventoryContext,
  ) {
    return tx.inventoryMovement.create({
      data: {
        productId: item.productId,
        variantId: item.variantId || null,
        orderId: context.orderId || null,
        branchId: context.branchId || null,
        userId: context.userId || null,
        type: context.type ?? InventoryMovementType.SALE,
        quantity,
        reason: context.reason ?? 'Venta confirmada',
      },
    });
  }
}
