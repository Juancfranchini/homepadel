/**
 * Único lugar que decide "qué precio vale". Antes el frontend reimplementaba
 * esto en 7 componentes distintos con `salePrice ?? price` — que trata un
 * `salePrice` de 0 como precio válido y mostraba "$0" en la tienda mientras
 * el checkout cobraba el precio de lista real. Estas pruebas fijan la regla
 * correcta para que no vuelva a divergir.
 */

import { effectivePrice } from './effective-price';

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
