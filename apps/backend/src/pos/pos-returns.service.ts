import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InventoryMovementType,
  InventoryStatus,
  PaymentKind,
  PaymentMethod,
  PaymentState,
  Prisma,
} from '@prisma/client';
import { InventoryService } from '../inventory/inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import { CancelSaleDto, CreateReturnDto } from './dto/returns.dto';
import { PosPaymentsService } from './pos-payments.service';

@Injectable()
export class PosReturnsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
    private readonly payments: PosPaymentsService,
  ) {}

  async createReturn(orderId: string, dto: CreateReturnDto, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { product: { select: { isMadeToOrder: true } }, returnItems: true } },
        },
      });
      if (!order) throw new NotFoundException('Venta no encontrada');
      if (order.status === 'CANCELLED') throw new ConflictException('La venta está cancelada');

      const resolved = dto.items.map((requested) => {
        const item = order.items.find((candidate) => candidate.id === requested.orderItemId);
        if (!item) throw new BadRequestException('Un producto no pertenece a la venta');
        const returned = item.returnItems.reduce((sum, entry) => sum + entry.quantity, 0);
        if (requested.quantity + returned > item.quantity) {
          throw new BadRequestException('La cantidad devuelta supera la cantidad vendida');
        }
        return { requested, item };
      });
      const saleReturn = await tx.saleReturn.create({
        data: {
          orderId,
          type: dto.type,
          reason: dto.reason,
          refundAmount: dto.refundAmount ?? 0,
          createdById: actorId,
          items: {
            create: resolved.map(({ requested, item }) => ({
              orderItemId: item.id,
              quantity: requested.quantity,
              restock: requested.restock ?? true,
              amount: item.price * requested.quantity,
            })),
          },
        },
      });

      const restock = resolved
        .filter(({ requested, item }) => (requested.restock ?? true) && !item.product.isMadeToOrder)
        .map(({ requested, item }) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: requested.quantity,
        }));
      await this.inventory.restoreWithClient(tx, restock, {
        orderId,
        branchId: order.branchId || undefined,
        userId: actorId,
        type: InventoryMovementType.RETURN,
        reason: `${dto.type === 'EXCHANGE' ? 'Cambio' : 'Devolución'}: ${dto.reason}`,
      });

      if ((dto.refundAmount ?? 0) > 0) {
        if (!dto.refundMethod) throw new BadRequestException('Indicá el medio del reintegro');
        const refund = await this.payments.refundWithClient(
          tx,
          order,
          dto.refundAmount!,
          dto.refundMethod,
          actorId,
          dto.reference,
          dto.cashSessionId,
        );
        await tx.order.update({ where: { id: orderId }, data: { paymentStatus: refund.status } });
      }
      await tx.auditLog.create({
        data: {
          actorId,
          entityType: 'Order',
          entityId: orderId,
          action: dto.type,
          changes: { returnId: saleReturn.id, refundAmount: dto.refundAmount ?? 0 },
        },
      });
      return tx.saleReturn.findUnique({
        where: { id: saleReturn.id },
        include: {
          items: { include: { orderItem: { include: { product: true, variant: true } } } },
        },
      });
    });
  }

  async cancel(orderId: string, dto: CancelSaleDto, actorId: string) {
    return this.prisma.$transaction((tx) => this.cancelWithClient(tx, orderId, dto, actorId));
  }

  private async cancelWithClient(
    tx: Prisma.TransactionClient,
    orderId: string,
    dto: CancelSaleDto,
    actorId: string,
  ) {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: { select: { isMadeToOrder: true } } } },
        payments: true,
      },
    });
    if (!order) throw new NotFoundException('Venta no encontrada');
    if (order.status === 'CANCELLED') return order;
    this.assertMercadoPagoRefunded(order);
    await this.restoreCancelledStock(tx, order, dto.reason, actorId);
    const chargeCount = await this.refundCharges(tx, order, dto, actorId);
    const updated = await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        paymentStatus: chargeCount ? 'REFUNDED' : 'PENDING',
        inventoryStatus:
          order.inventoryStatus === InventoryStatus.DEDUCTED
            ? InventoryStatus.RESTORED
            : order.inventoryStatus,
        cancelledAt: new Date(),
        cancellationReason: dto.reason,
        updatedById: actorId,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId,
        entityType: 'Order',
        entityId: orderId,
        action: 'CANCELLED',
        changes: { reason: dto.reason },
      },
    });
    return updated;
  }

  private assertMercadoPagoRefunded(order: CancelOrder) {
    const balance = this.paymentBalances(order).get(PaymentMethod.MERCADOPAGO) ?? 0;
    if (balance > 0.009) {
      throw new ConflictException(
        'Reintegrá primero en Mercado Pago y registrá la devolución con su referencia',
      );
    }
  }

  private async restoreCancelledStock(
    tx: Prisma.TransactionClient,
    order: CancelOrder,
    reason: string,
    actorId: string,
  ) {
    if (order.inventoryStatus !== InventoryStatus.DEDUCTED) return;
    await this.inventory.restoreWithClient(
      tx,
      order.items
        .filter((item) => !item.product.isMadeToOrder)
        .map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      {
        orderId: order.id,
        branchId: order.branchId || undefined,
        userId: actorId,
        type: InventoryMovementType.CANCELLATION,
        reason: `Cancelación: ${reason}`,
      },
    );
  }

  private async refundCharges(
    tx: Prisma.TransactionClient,
    order: CancelOrder,
    dto: CancelSaleDto,
    actorId: string,
  ) {
    const charges = order.payments.filter((payment) => payment.kind === PaymentKind.CHARGE);
    for (const [method, amount] of this.paymentBalances(order)) {
      if (amount > 0) {
        await this.payments.refundWithClient(
          tx,
          order,
          amount,
          method,
          actorId,
          `Cancelación ${order.number}`,
          dto.cashSessionId,
        );
      }
    }
    return charges.length;
  }

  private paymentBalances(order: CancelOrder) {
    const balances = new Map<PaymentMethod, number>();
    for (const payment of order.payments) {
      if (payment.status !== PaymentState.CONFIRMED) continue;
      const signed = payment.kind === PaymentKind.REFUND ? -payment.amount : payment.amount;
      balances.set(payment.method, (balances.get(payment.method) ?? 0) + signed);
    }
    return balances;
  }
}

type CancelOrder = Prisma.OrderGetPayload<{
  include: {
    items: { include: { product: { select: { isMadeToOrder: true } } } };
    payments: true;
  };
}>;
