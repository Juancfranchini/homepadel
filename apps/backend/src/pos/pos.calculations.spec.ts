import { BadRequestException } from '@nestjs/common';
import { DiscountType, PaymentKind, PaymentStatus } from '@prisma/client';
import {
  assertPaymentAmount,
  calculateSaleTotal,
  netPaid,
  paymentStatusFor,
} from './pos.calculations';

describe('POS calculations', () => {
  it('aplica porcentaje y envío sin permitir un descuento mayor al subtotal', () => {
    expect(calculateSaleTotal(1000, 200, DiscountType.PERCENTAGE, 10)).toEqual({
      discount: 100,
      total: 1100,
    });
    expect(calculateSaleTotal(1000, 0, DiscountType.AMOUNT, 3000)).toEqual({
      discount: 1000,
      total: 0,
    });
  });

  it('distingue venta pendiente, cobro parcial y cobro completo', () => {
    expect(paymentStatusFor(1000, 0)).toBe(PaymentStatus.PENDING);
    expect(paymentStatusFor(1000, 400)).toBe(PaymentStatus.PARTIAL);
    expect(paymentStatusFor(1000, 1000)).toBe(PaymentStatus.PAID);
  });

  it('resta reintegros del dinero efectivamente cobrado', () => {
    expect(
      netPaid([
        { amount: 1000, kind: PaymentKind.CHARGE },
        { amount: 250, kind: PaymentKind.REFUND },
      ]),
    ).toBe(750);
  });

  it('rechaza cobros que superarían el total', () => {
    expect(() => assertPaymentAmount(1000, 700, 301)).toThrow(BadRequestException);
  });
});
