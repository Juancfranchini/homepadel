import { precioEfectivoEnRango } from './products.price-filter';

// Un FieldRef real solo lo arma Prisma; para las pruebas alcanza con un marcador.
const PRICE_FIELD = { name: 'price', modelName: 'Product' } as never;

/**
 * Evalúa el filtro contra un producto, replicando lo que haría la base.
 * Así la prueba verifica el resultado —qué productos entran— y no la forma
 * del objeto, que podría reescribirse sin cambiar el comportamiento.
 */
function entra(filtro: any, producto: { price: number; salePrice: number | null }): boolean {
  const valorDe = (v: unknown): number => (v === PRICE_FIELD ? producto.price : (v as number));
  const cumple = (campo: 'price' | 'salePrice', cond: any): boolean => {
    const valor = producto[campo];
    if (cond === null) return valor === null;
    if (valor === null) return false;
    if (cond.gt != null && !(valor > valorDe(cond.gt))) return false;
    if (cond.gte != null && !(valor >= valorDe(cond.gte))) return false;
    if (cond.lt != null && !(valor < valorDe(cond.lt))) return false;
    if (cond.lte != null && !(valor <= valorDe(cond.lte))) return false;
    return true;
  };
  const evaluar = (f: any): boolean => {
    if (f.OR) return f.OR.some(evaluar);
    if (f.AND) return f.AND.every(evaluar);
    return Object.entries(f).every(([campo, cond]) => cumple(campo as 'price' | 'salePrice', cond));
  };
  return evaluar(filtro);
}

describe('precioEfectivoEnRango', () => {
  it('sin mínimo ni máximo no filtra nada', () => {
    expect(precioEfectivoEnRango(PRICE_FIELD)).toBeNull();
  });

  it('usa el precio de oferta cuando la oferta es válida', () => {
    const filtro = precioEfectivoEnRango(PRICE_FIELD, undefined, 450000);
    // De lista $500.000, en oferta a $400.000: el cliente paga $400.000.
    expect(entra(filtro, { price: 500000, salePrice: 400000 })).toBe(true);
  });

  it('usa el precio de lista cuando no hay oferta', () => {
    const filtro = precioEfectivoEnRango(PRICE_FIELD, undefined, 450000);
    expect(entra(filtro, { price: 500000, salePrice: null })).toBe(false);
    expect(entra(filtro, { price: 300000, salePrice: null })).toBe(true);
  });

  it('ignora una oferta de 0 o mayor al precio de lista, igual que effectivePrice', () => {
    const filtro = precioEfectivoEnRango(PRICE_FIELD, undefined, 450000);
    expect(entra(filtro, { price: 500000, salePrice: 0 })).toBe(false);
    expect(entra(filtro, { price: 500000, salePrice: 600000 })).toBe(false);
  });

  it('respeta el mínimo y el máximo a la vez', () => {
    const filtro = precioEfectivoEnRango(PRICE_FIELD, 100000, 300000);
    expect(entra(filtro, { price: 50000, salePrice: null })).toBe(false);
    expect(entra(filtro, { price: 200000, salePrice: null })).toBe(true);
    expect(entra(filtro, { price: 350000, salePrice: null })).toBe(false);
  });
});
