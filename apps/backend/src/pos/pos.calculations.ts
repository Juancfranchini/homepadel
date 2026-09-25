import { BadRequestException } from '@nestjs/common';
import { DiscountType, PaymentKind, PaymentStatus } from '@prisma/client';

export interface AmountPayment {
  amount: number;
  kind?: PaymentKind;
}

export function calculateDiscount(subtotal: number, type?: DiscountType, value = 0): number {
  if (!type || value <= 0) return 0;
  const raw = type === DiscountType.PERCENTAGE ? (subtotal * value) / 100 : value;
  return Math.min(subtotal, Math.round(raw * 100) / 100);
}

export function calculateSaleTotal(
  subtotal: number,
  shipping: number,
  type?: DiscountType,
  value = 0,
) {
  const discount = calculateDiscount(subtotal, type, value);
  return { discount, total: Math.max(0, subtotal + shipping - discount) };
}

export function netPaid(payments: AmountPayment[]): number {
  return payments.reduce(
    (sum, payment) =>
      sum + (payment.kind === PaymentKind.REFUND ? -payment.amount : payment.amount),
    0,
  );
}

export function paymentStatusFor(total: number, paid: number): PaymentStatus {
  const normalized = Math.round(paid * 100) / 100;
  if (normalized <= 0) return normalized < 0 ? PaymentStatus.REFUNDED : PaymentStatus.PENDING;
  if (normalized < total) return PaymentStatus.PARTIAL;
  return PaymentStatus.PAID;
}

export function assertPaymentAmount(total: number, current: number, incoming: number): void {
  if (incoming <= 0) throw new BadRequestException('El importe del cobro debe ser mayor a cero');
  if (Math.round((current + incoming - total) * 100) > 0) {
    throw new BadRequestException('Los cobros superan el total de la venta');
  }
}
