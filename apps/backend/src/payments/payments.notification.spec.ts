/**
 * Lectura del aviso de pago de Mercado Pago.
 *
 * Mercado Pago avisa de dos maneras según cómo esté configurada la cuenta:
 *
 *   · Webhooks: {type:'payment', data:{id:'123'}} en el cuerpo
 *   · IPN: cuerpo vacío y ?topic=payment&id=123 en la query string
 *
 * El handler solo entendía la primera y descartaba la segunda sin decir nada.
 * Con la cuenta en IPN, el pago se acreditaba en Mercado Pago y la orden se
 * quedaba en PENDING para siempre — había que marcarla a mano en el
 * backoffice.
 */

import { PaymentsService } from './payments.service';

function service() {
  return new PaymentsService(null as any, null as any, null as any, { markRecovered: jest.fn() } as any);
}

/** `identificarAviso` es privado; en TypeScript eso es solo de compilación. */
function leer(body: any, query: Record<string, string> = {}) {
  return (service() as any).identificarAviso(body, query);
}

describe('De qué avisa Mercado Pago', () => {
  it('entiende el formato Webhooks, con el detalle en el cuerpo', () => {
    expect(leer({ type: 'payment', data: { id: '123' } })).toEqual({ topic: 'payment', paymentId: '123' });
  });

  it('entiende el formato IPN, con topic e id en la query string', () => {
    expect(leer({}, { topic: 'payment', id: '123' })).toEqual({ topic: 'payment', paymentId: '123' });
  });

  it('entiende la variante con `data.id` en la query string', () => {
    expect(leer({}, { type: 'payment', 'data.id': '123' })).toEqual({ topic: 'payment', paymentId: '123' });
  });

  it('acepta un identificador numérico y lo normaliza a texto', () => {
    expect(leer({ type: 'payment', data: { id: 123456789 } }).paymentId).toBe('123456789');
  });

  it('no confunde un aviso de otro tipo con uno de pago', () => {
    expect(leer({ type: 'merchant_order', data: { id: '9' } }).topic).toBe('merchant_order');
    expect(leer({}, { topic: 'merchant_order', id: '9' }).topic).toBe('merchant_order');
  });

  it('no inventa un identificador cuando el aviso no lo trae', () => {
    expect(leer({ type: 'payment' }).paymentId).toBeNull();
    expect(leer({}, {}).topic).toBeNull();
  });
});

describe('handleWebhook — salidas tempranas', () => {
  it('ignora un aviso que no es de un pago, sin tocar la base', async () => {
    const svc = service();
    await expect(svc.handleWebhook({ type: 'merchant_order', data: { id: '9' } }, '', '')).resolves.toEqual({ received: true });
  });

  it('ignora un aviso de pago sin identificador', async () => {
    const svc = service();
    await expect(svc.handleWebhook({ type: 'payment' }, '', '')).resolves.toEqual({ received: true });
  });

  it('con un aviso IPN válido ya no sale por el camino de "no es un pago"', async () => {
    // Sin secreto configurado y fuera de producción la firma se omite, así
    // que el aviso avanza: lo que se comprueba es que deja de descartarse.
    const original = process.env.MERCADOPAGO_WEBHOOK_SECRET;
    delete process.env.MERCADOPAGO_WEBHOOK_SECRET;

    const prisma = { order: { findFirst: jest.fn().mockResolvedValue({ id: 'ya-procesada' }) } };
    const svc = new PaymentsService(prisma as any, null as any, null as any, { markRecovered: jest.fn() } as any);

    const resultado = await svc.handleWebhook({}, '', '', { topic: 'payment', id: '123' });

    expect(prisma.order.findFirst).toHaveBeenCalled();
    expect(resultado).toEqual({ received: true, alreadyProcessed: true });

    if (original === undefined) delete process.env.MERCADOPAGO_WEBHOOK_SECRET;
    else process.env.MERCADOPAGO_WEBHOOK_SECRET = original;
  });
});
