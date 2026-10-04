import { PaymentKind, PaymentState } from '@prisma/client';
import { datosAlConfirmarPago } from './orders.confirm-payment';

const AHORA = new Date('2026-10-04T15:00:00Z');
const pedido = (cambios: Record<string, unknown> = {}) => ({
  id: 'o-1',
  total: 99000,
  notes: JSON.stringify({ paymentMethod: 'transfer' }),
  paidAt: null,
  payments: [],
  ...cambios,
});

describe('confirmar el pago de un pedido desde Pedidos', () => {
  it('una transferencia queda cobrada: pago pagado, fecha y cobro confirmado por el total', () => {
    const { pedido: datos, cobro } = datosAlConfirmarPago(pedido(), AHORA);
    expect(datos).toEqual({ paymentStatus: 'PAID', paidAt: AHORA });
    expect(cobro).toMatchObject({ orderId: 'o-1', method: 'TRANSFER', status: 'CONFIRMED', amount: 99000, receivedAt: AHORA });
  });

  it('si ya tiene un cobro confirmado no registra otro', () => {
    const conCobro = pedido({ payments: [{ kind: PaymentKind.CHARGE, status: PaymentState.CONFIRMED }] });
    expect(datosAlConfirmarPago(conCobro, AHORA).cobro).toBeNull();
  });

  it('un cobro anulado no cuenta como cobrado', () => {
    const anulado = pedido({ payments: [{ kind: PaymentKind.CHARGE, status: PaymentState.VOIDED }] });
    expect(datosAlConfirmarPago(anulado, AHORA).cobro).not.toBeNull();
  });

  it('otros medios (Mercado Pago) no generan un cobro a mano', () => {
    expect(datosAlConfirmarPago(pedido({ notes: JSON.stringify({ paymentMethod: 'mercadopago' }) }), AHORA).cobro).toBeNull();
  });

  it('conserva la fecha de pago si ya tenía una', () => {
    const fecha = new Date('2026-10-01T10:00:00Z');
    expect(datosAlConfirmarPago(pedido({ paidAt: fecha }), AHORA).pedido.paidAt).toBe(fecha);
  });
});
