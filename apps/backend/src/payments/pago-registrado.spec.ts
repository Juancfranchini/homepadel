import { filtroOrdenConPago } from './pago-registrado';

/** Aplica el filtro como lo haría la base, sobre el texto de las notas. */
function coincide(notas: string, id: string) {
  const { OR } = filtroOrdenConPago(id) as { OR: { notes: { contains: string } }[] };
  return OR.some((f) => notas.includes(f.notes.contains));
}

describe('filtroOrdenConPago', () => {
  it('encuentra la orden que tiene ese pago registrado', () => {
    expect(coincide(JSON.stringify({ paymentId: 1002, buyerEmail: 'a@b.com' }), '1002')).toBe(true);
    expect(coincide(JSON.stringify({ buyerEmail: 'a@b.com', paymentId: 1002 }), '1002')).toBe(true);
    expect(coincide(JSON.stringify({ paymentId: '1002' }), '1002')).toBe(true);
  });

  it('no confunde el número del pago con otro dato que lo contenga', () => {
    expect(coincide(JSON.stringify({ preferenceId: 'pref_1002' }), '1002')).toBe(false);
    expect(coincide(JSON.stringify({ metaCliente: { fbp: 'fb.1.1790684100212.123' } }), '1002')).toBe(false);
    expect(coincide(JSON.stringify({ paymentId: 10021 }), '1002')).toBe(false);
  });
});
