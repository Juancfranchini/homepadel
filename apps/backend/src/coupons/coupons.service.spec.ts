/**
 * Cupones (P2) — antes esto era una lista fija en el navegador
 * (`VALID_COUPONS`) con un 10% hardcodeado; cualquiera que mirara el fuente
 * los veía y el descuento nunca llegaba al servidor.
 *
 * Lo que estas pruebas protegen:
 *  · un código inválido, vencido, sin usos o por debajo del mínimo se rechaza;
 *  · el cálculo de descuento (porcentaje o monto fijo) nunca deja el total
 *    negativo;
 *  · la búsqueda no distingue mayúsculas de minúsculas.
 */

import { BadRequestException } from '@nestjs/common';
import { CouponsService } from './coupons.service';

function fakePrisma(coupon: any) {
  return {
    coupon: {
      findFirst: jest.fn(async ({ where }: any) => {
        if (!coupon) return null;
        const buscado = where.code.equals.toLowerCase();
        return coupon.code.toLowerCase() === buscado ? coupon : null;
      }),
      update: jest.fn(async () => coupon),
    },
  } as any;
}

const VIGENTE = {
  id: 'c1', code: 'HOMEPADEL10', type: 'PERCENTAGE', discount: 10,
  minAmount: null, maxUses: null, usedCount: 0, active: true, expiresAt: null,
};

describe('CouponsService — validate', () => {
  it('acepta un cupón vigente sin importar mayúsculas/minúsculas', async () => {
    const service = new CouponsService(fakePrisma(VIGENTE));
    await expect(service.validate('homepadel10')).resolves.toMatchObject({ id: 'c1' });
  });

  it('rechaza un código que no existe', async () => {
    const service = new CouponsService(fakePrisma(null));
    await expect(service.validate('NO-EXISTE')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza un cupón inactivo', async () => {
    const service = new CouponsService(fakePrisma({ ...VIGENTE, active: false }));
    await expect(service.validate('HOMEPADEL10')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza un cupón vencido', async () => {
    const vencido = { ...VIGENTE, expiresAt: new Date('2000-01-01') };
    const service = new CouponsService(fakePrisma(vencido));
    await expect(service.validate('HOMEPADEL10')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza un cupón sin usos disponibles', async () => {
    const agotado = { ...VIGENTE, maxUses: 5, usedCount: 5 };
    const service = new CouponsService(fakePrisma(agotado));
    await expect(service.validate('HOMEPADEL10')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza si el subtotal no llega al monto mínimo', async () => {
    const conMinimo = { ...VIGENTE, minAmount: 50000 };
    const service = new CouponsService(fakePrisma(conMinimo));
    await expect(service.validate('HOMEPADEL10', 30000)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('acepta si el subtotal llega justo al monto mínimo', async () => {
    const conMinimo = { ...VIGENTE, minAmount: 50000 };
    const service = new CouponsService(fakePrisma(conMinimo));
    await expect(service.validate('HOMEPADEL10', 50000)).resolves.toMatchObject({ id: 'c1' });
  });

  it('no valida el mínimo si no se pasa subtotal (preview sin carrito)', async () => {
    const conMinimo = { ...VIGENTE, minAmount: 50000 };
    const service = new CouponsService(fakePrisma(conMinimo));
    await expect(service.validate('HOMEPADEL10')).resolves.toMatchObject({ id: 'c1' });
  });
});

describe('CouponsService — calculateDiscount', () => {
  const service = new CouponsService(fakePrisma(null));

  it('calcula un porcentaje sobre el subtotal', () => {
    expect(service.calculateDiscount({ type: 'PERCENTAGE', discount: 10 }, 100000)).toBe(10000);
  });

  it('aplica un monto fijo', () => {
    expect(service.calculateDiscount({ type: 'FIXED', discount: 5000 }, 100000)).toBe(5000);
  });

  it('nunca deja el descuento por encima del subtotal', () => {
    expect(service.calculateDiscount({ type: 'FIXED', discount: 99999 }, 1000)).toBe(1000);
  });

  it('redondea el porcentaje', () => {
    expect(service.calculateDiscount({ type: 'PERCENTAGE', discount: 15 }, 9999)).toBe(1500);
  });
});
