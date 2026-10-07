import { avisarAlCliente, queAvisar } from './orders.status-emails';

describe('qué se le avisa al cliente al cambiar el estado', () => {
  it('pendiente → pagado: recibimos tu pago, y se registra el cobro', () => {
    expect(queAvisar({ status: 'PENDING' }, { status: 'PAID' })).toEqual({ pasoAPagado: true, pagoRecibido: true, despachado: false });
  });

  it('pendiente → enviado es "pagado y enviado": un solo mail, el de despacho', () => {
    expect(queAvisar({ status: 'PENDING' }, { status: 'SHIPPED', trackingNumber: 'AR1' })).toEqual({ pasoAPagado: true, pagoRecibido: false, despachado: true });
  });

  it('pagado → enviado: solo el despacho, no se repite el aviso de pago', () => {
    expect(queAvisar({ status: 'PAID' }, { status: 'SHIPPED' })).toEqual({ pasoAPagado: false, pagoRecibido: false, despachado: true });
  });

  it('ya enviado: cargar o corregir el seguimiento vuelve a avisar; guardar lo mismo, no', () => {
    expect(queAvisar({ status: 'SHIPPED', trackingNumber: 'AR1' }, { status: 'SHIPPED', trackingNumber: 'AR2' }).despachado).toBe(true);
    expect(queAvisar({ status: 'SHIPPED', trackingNumber: 'AR1' }, { status: 'SHIPPED', trackingNumber: 'AR1' }).despachado).toBe(false);
    expect(queAvisar({ status: 'SHIPPED' }, { status: 'SHIPPED' }).despachado).toBe(false);
  });

  it('entregado desde pagado no manda nada', () => {
    expect(queAvisar({ status: 'PAID' }, { status: 'DELIVERED' })).toEqual({ pasoAPagado: false, pagoRecibido: false, despachado: false });
  });
});

describe('avisarAlCliente', () => {
  const PEDIDO = {
    number: 'HP-1',
    total: 200000,
    address: 'Calle 1',
    trackingNumber: 'AR1',
    trackingUrl: 'https://c.example/AR1',
    notes: JSON.stringify({ buyerEmail: 'ana@ejemplo.com', buyerName: 'Ana', shippingCarrier: 'correo_argentino' }),
    user: null,
    items: [{ quantity: 2, price: 100000, product: { name: 'Paleta' } }],
  };
  const armar = (pedido: unknown = PEDIDO) => {
    const prisma = { order: { findUnique: jest.fn().mockResolvedValue(pedido) } };
    const emails = { sendPaymentReceived: jest.fn().mockResolvedValue({}), sendOrderShipped: jest.fn().mockResolvedValue({}) };
    return { prisma, emails };
  };
  const DESPACHADO = { pasoAPagado: false, pagoRecibido: false, despachado: true };
  const PAGO = { pasoAPagado: true, pagoRecibido: true, despachado: false };

  it('despachado: manda el seguimiento al mail del checkout', async () => {
    const { prisma, emails } = armar();
    await avisarAlCliente(prisma as never, emails as never, 'o-1', DESPACHADO);
    expect(emails.sendOrderShipped).toHaveBeenCalledWith('ana@ejemplo.com', 'HP-1', 'Ana', 'AR1', 'https://c.example/AR1');
  });

  it('retiro en el local: no se le manda "despachado"', async () => {
    const { prisma, emails } = armar({ ...PEDIDO, notes: JSON.stringify({ buyerEmail: 'ana@ejemplo.com', shippingCarrier: 'retiro_local' }) });
    await avisarAlCliente(prisma as never, emails as never, 'o-1', DESPACHADO);
    expect(emails.sendOrderShipped).not.toHaveBeenCalled();
  });

  it('pago recibido: va con los productos y el total', async () => {
    const { prisma, emails } = armar();
    await avisarAlCliente(prisma as never, emails as never, 'o-1', PAGO);
    expect(emails.sendPaymentReceived).toHaveBeenCalledWith(
      'ana@ejemplo.com',
      expect.objectContaining({ orderNumber: 'HP-1', total: 200000, esRetiro: false, items: [{ name: 'Paleta', quantity: 2, price: 100000 }] }),
    );
  });

  it('sin avisos que mandar no consulta nada', async () => {
    const { prisma, emails } = armar();
    await avisarAlCliente(prisma as never, emails as never, 'o-1', { pasoAPagado: false, pagoRecibido: false, despachado: false });
    expect(prisma.order.findUnique).not.toHaveBeenCalled();
  });

  it('si el mail falla no lanza: el estado ya se guardó', async () => {
    const { prisma, emails } = armar();
    emails.sendOrderShipped.mockRejectedValue(new Error('Resend caído'));
    await expect(avisarAlCliente(prisma as never, emails as never, 'o-1', DESPACHADO)).resolves.toBeUndefined();
  });

  it('un pedido sin mail (venta del local) no rompe', async () => {
    const { prisma, emails } = armar({ ...PEDIDO, notes: null });
    await avisarAlCliente(prisma as never, emails as never, 'o-1', PAGO);
    expect(emails.sendPaymentReceived).not.toHaveBeenCalled();
  });
});
