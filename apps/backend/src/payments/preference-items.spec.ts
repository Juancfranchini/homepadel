import { itemsDePreferencia } from './preference-items';

const item = (productId: string, price: number, quantity: number) => ({ productId, name: productId, price, quantity });
const total = (items: { unit_price: number; quantity: number }[]) => Math.round(items.reduce((a, i) => a + i.unit_price * i.quantity, 0) * 100) / 100;

describe('itemsDePreferencia', () => {
  it('sin cupón manda los precios tal cual', () => {
    expect(itemsDePreferencia([item('a', 1000, 2)], 0)).toEqual([{ id: 'a', title: 'a', quantity: 2, unit_price: 1000, currency_id: 'ARS' }]);
  });

  it('con cupón no manda ningún precio negativo y el total queda exacto', () => {
    const r = itemsDePreferencia([item('a', 340000, 1), item('b', 45000, 3)], 47500, 'LANZ');
    expect(r.every((i) => i.unit_price > 0)).toBe(true);
    expect(total(r)).toBe(340000 + 135000 - 47500);
    expect(r[0].title).toContain('cupón LANZ');
  });

  it('si una línea no divide justo, separa una unidad para no perder centavos', () => {
    const r = itemsDePreferencia([item('a', 100, 3)], 100);
    expect(total(r)).toBe(200);
    expect(r.reduce((a, i) => a + i.quantity, 0)).toBe(3);
  });
});
