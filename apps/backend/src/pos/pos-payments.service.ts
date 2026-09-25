import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PaymentKind, PaymentMethod, PaymentState, Prisma } from '@prisma/client';
import { PosPaymentDto } from './dto/pos-sale.dto';
import { assertPaymentAmount, netPaid, paymentStatusFor } from './pos.calculations';

interface PaymentOrder {
  id: string;
  total: number;
}

@Injectable()
export class PosPaymentsService {
  async currentPaid(tx: Prisma.TransactionClient, orderId: string): Promise<number> {
    const payments = await tx.payment.findMany({
      where: { orderId, status: PaymentState.CONFIRMED },
      select: { amount: true, kind: true },
    });
    return netPaid(payments);
  }

  async recordWithClient(
    tx: Prisma.TransactionClient,
    order: PaymentOrder,
    payments: PosPaymentDto[],
    actorId: string,
    cashSessionId?: string,
  ) {
    this.assertManualMethods(payments);
    const current = await this.currentPaid(tx, order.id);
    const incoming = payments.reduce((sum, payment) => sum + payment.amount, 0);
    if (incoming > 0) assertPaymentAmount(order.total, current, incoming);

    if (payments.some((payment) => payment.method === PaymentMethod.CASH)) {
      await this.assertOpenSession(tx, cashSessionId);
    }

    for (const input of payments) {
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          method: input.method,
          amount: input.amount,
          reference: input.reference || null,
          createdById: actorId,
          cashSessionId: cashSessionId || null,
        },
      });
      if (input.method === PaymentMethod.CASH && cashSessionId) {
        await tx.cashMovement.create({
          data: {
            cashSessionId,
            orderId: order.id,
            paymentId: payment.id,
            userId: actorId,
            type: 'SALE',
            method: PaymentMethod.CASH,
            amount: input.amount,
            note: 'Cobro en efectivo',
          },
        });
      }
    }

    const paid = current + incoming;
    return { paid, status: paymentStatusFor(order.total, paid) };
  }

  async refundWithClient(
    tx: Prisma.TransactionClient,
    order: PaymentOrder,
    amount: number,
    method: PaymentMethod,
    actorId: string,
    reference?: string,
    cashSessionId?: string,
  ) {
    if (method === PaymentMethod.MERCADOPAGO && !reference?.trim()) {
      throw new BadRequestException(
        'Confirmá el reintegro en Mercado Pago e ingresá su referencia antes de registrarlo',
      );
    }
    if (method === PaymentMethod.CASH) await this.assertOpenSession(tx, cashSessionId);
    const paid = await this.currentPaid(tx, order.id);
    const paidWithMethod = await this.currentPaidByMethod(tx, order.id, method);
    if (amount <= 0 || amount > paid || amount > paidWithMethod) {
      throw new BadRequestException(
        'El reintegro debe ser mayor a cero y no superar lo cobrado por ese medio',
      );
    }
    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        method,
        kind: PaymentKind.REFUND,
        amount,
        reference: reference || null,
        createdById: actorId,
        cashSessionId: cashSessionId || null,
      },
    });
    if (method === PaymentMethod.CASH && cashSessionId) {
      await tx.cashMovement.create({
        data: {
          cashSessionId,
          orderId: order.id,
          paymentId: payment.id,
          userId: actorId,
          type: 'REFUND',
          method,
          amount: -amount,
          note: 'Reintegro en efectivo',
        },
      });
    }
    const remaining = paid - amount;
    const status = remaining <= 0 ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
    return { remaining, status } as const;
  }

  private assertManualMethods(payments: PosPaymentDto[]): void {
    if (payments.some((payment) => payment.method === PaymentMethod.MERCADOPAGO)) {
      throw new BadRequestException('Un cobro manual no puede simular un pago de Mercado Pago');
    }
  }

  private async currentPaidByMethod(
    tx: Prisma.TransactionClient,
    orderId: string,
    method: PaymentMethod,
  ) {
    const payments = await tx.payment.findMany({
      where: { orderId, method, status: PaymentState.CONFIRMED },
      select: { amount: true, kind: true },
    });
    return netPaid(payments);
  }

  private async assertOpenSession(tx: Prisma.TransactionClient, cashSessionId?: string) {
    if (!cashSessionId) throw new ConflictException('Abrí una caja antes de cobrar en efectivo');
    const session = await tx.cashSession.findFirst({
      where: { id: cashSessionId, status: 'OPEN' },
      select: { id: true },
    });
    if (!session) throw new ConflictException('La caja seleccionada no está abierta');
  }
}
