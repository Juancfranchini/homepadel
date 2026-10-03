import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/coupon.dto';

function servicio() {
  const prisma = {
    coupon: {
      create: jest.fn(async ({ data }) => data),
      update: jest.fn(async ({ data }) => data),
      findUnique: jest.fn().mockResolvedValue({ id: 'c-1', type: 'PERCENTAGE', discount: 10 }),
    },
  };
  return { prisma, service: new CouponsService(prisma as never) };
}

const errores = async (datos: Record<string, unknown>) =>
  (await validate(plainToInstance(CreateCouponDto, datos))).map((e) => e.property);

describe('cupones: tope de descuento', () => {
  it('un porcentaje sin tope descuenta el porcentaje completo', () => {
    expect(servicio().service.calculateDiscount({ type: 'PERCENTAGE', discount: 20 }, 1_000_000)).toBe(200_000);
  });

  it('con tope, nunca descuenta más que el tope', () => {
    expect(servicio().service.calculateDiscount({ type: 'PERCENTAGE', discount: 20, maxDiscount: 50_000 }, 1_000_000)).toBe(50_000);
  });

  it('si el porcentaje da menos que el tope, el tope no cambia nada', () => {
    expect(servicio().service.calculateDiscount({ type: 'PERCENTAGE', discount: 20, maxDiscount: 50_000 }, 100_000)).toBe(20_000);
  });

  it('el descuento nunca supera el subtotal, aun con tope alto', () => {
    expect(servicio().service.calculateDiscount({ type: 'FIXED', discount: 80_000, maxDiscount: 100_000 }, 30_000)).toBe(30_000);
  });
});

describe('cupones: validación del alta', () => {
  it('acepta un cupón bien armado, con tope', async () => {
    expect(await errores({ code: 'PALETAS20', discount: 20, type: 'PERCENTAGE', maxDiscount: 50000, maxUses: 100, minAmount: 0 })).toEqual([]);
  });

  it('rechaza descuento negativo, tipo inventado, código con espacios y usos no enteros', async () => {
    expect(await errores({ code: 'con espacio', discount: -5, type: 'REGALO', maxUses: 1.5 })).toEqual(
      expect.arrayContaining(['code', 'discount', 'type', 'maxUses']),
    );
  });

  it('un campo vaciado en el backoffice ("") queda como sin valor, no como error', async () => {
    expect(await errores({ code: 'ABC', discount: 10, type: 'FIXED', maxDiscount: '', expiresAt: '' })).toEqual([]);
  });

  it('un porcentaje mayor a 100 se rechaza al crear y al editar', async () => {
    const { service } = servicio();
    expect(() => service.create({ code: 'X100', discount: 150, type: 'PERCENTAGE' })).toThrow(BadRequestException);
    await expect(service.update('c-1', { discount: 120 })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('el código se guarda en mayúsculas y vaciar el vencimiento lo borra', async () => {
    const { service, prisma } = servicio();
    await service.update('c-1', { code: 'paletas20', expiresAt: null });
    expect(prisma.coupon.update).toHaveBeenCalledWith({ where: { id: 'c-1' }, data: { code: 'PALETAS20', expiresAt: null } });
  });
});
