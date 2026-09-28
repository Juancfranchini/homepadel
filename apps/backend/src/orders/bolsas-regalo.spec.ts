import { bolsasDeRegalo } from './bolsas-regalo';

describe('bolsasDeRegalo', () => {
  const items = [{ quantity: 2 }, { quantity: 1 }];

  it('sin pedido no van bolsas', () => {
    expect(bolsasDeRegalo(undefined, items)).toBe(0);
  });

  it('respeta lo pedido si no pasa las unidades', () => {
    expect(bolsasDeRegalo(2, items)).toBe(2);
  });

  it('nunca más bolsas que unidades compradas', () => {
    expect(bolsasDeRegalo(10, items)).toBe(3);
  });

  it('descarta negativos y decimales', () => {
    expect(bolsasDeRegalo(-4, items)).toBe(0);
    expect(bolsasDeRegalo(1.9, items)).toBe(1);
  });
});
