/**
 * Único lugar que decide "qué precio vale". Antes el frontend reimplementaba
 * esto en 7 componentes distintos con `salePrice ?? price` — que trata un
 * `salePrice` de 0 como precio válido y mostraba "$0" en la tienda mientras
 * el checkout cobraba el precio de lista real. Estas pruebas fijan la regla
 * correcta para que no vuelva a divergir.
 */

import { effectivePrice, precioPorTransferencia } from './effective-price';

describe('effectivePrice', () => {
  it('usa el precio de lista si no hay salePrice', () => {
    expect(effectivePrice(100000, null)).toBe(100000);
    expect(effectivePrice(100000, undefined)).toBe(100000);
  });

  it('usa el salePrice cuando es válido', () => {
    expect(effectivePrice(100000, 80000)).toBe(80000);
  });

  it('ignora un salePrice de 0 — no es una oferta real', () => {
    expect(effectivePrice(120000, 0)).toBe(120000);
  });

  it('ignora un salePrice negativo', () => {
    expect(effectivePrice(100000, -1)).toBe(100000);
  });

  it('ignora un salePrice mayor o igual al de lista', () => {
    expect(effectivePrice(100000, 150000)).toBe(100000);
    expect(effectivePrice(100000, 100000)).toBe(100000);
  });
});

describe('precioPorTransferencia', () => {
  it('usa el precio de transferencia cuando es menor que el vigente', () => {
    expect(precioPorTransferencia(700000, null, 560000)).toBe(560000);
  });

  it('sin precio de transferencia (vacío o cero) cobra el vigente', () => {
    expect(precioPorTransferencia(700000, null, null)).toBe(700000);
    expect(precioPorTransferencia(700000, null, 0)).toBe(700000);
  });

  it('si la promo es más barata que el de transferencia, vale la promo', () => {
    expect(precioPorTransferencia(700000, 500000, 560000)).toBe(500000);
  });
});
