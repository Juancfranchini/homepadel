import * as crypto from 'crypto';
import { informarTransferenciaPagadaAMeta } from './payments.meta';

const sha256 = (v: string) => crypto.createHash('sha256').update(v).digest('hex');

function construir(order: Record<string, unknown> | null) {
  const prisma = {
    order: { findUnique: jest.fn().mockResolvedValue(order) },
    siteSection: { findUnique: jest.fn().mockResolvedValue({ data: { pixelId: '1041282918808105', accessToken: 'token' } }) },
  };
  global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 }) as never;
  return prisma;
}

const cuerpo = () => JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);

const ORDEN_TRANSFERENCIA = {
  number: 'HP-100',
  channel: 'ONLINE',
  total: 754500,
  notes: JSON.stringify({ paymentMethod: 'transfer', buyerEmail: 'Cliente@Ejemplo.com', buyerPhone: '11 4083-2310' }),
  items: [{ productId: 'prod-1', quantity: 1, price: 750000 }],
};

describe('informarTransferenciaPagadaAMeta', () => {
  it('informa la compra con el total real de la orden, no un valor fijo', async () => {
    await informarTransferenciaPagadaAMeta(construir(ORDEN_TRANSFERENCIA) as never, 'o-1');

    const evento = cuerpo().data[0];
    expect(evento.event_name).toBe('Purchase');
    expect(evento.event_id).toBe('purchase_HP-100');
    expect(evento.custom_data).toMatchObject({ value: 754500, currency: 'ARS', content_ids: ['prod-1'] });
  });

  it('manda email y teléfono cifrados, nunca en claro', async () => {
    await informarTransferenciaPagadaAMeta(construir(ORDEN_TRANSFERENCIA) as never, 'o-1');

    const enviado = (global.fetch as jest.Mock).mock.calls[0][1].body as string;
    expect(cuerpo().data[0].user_data.em).toEqual([sha256('cliente@ejemplo.com')]);
    expect(cuerpo().data[0].user_data.ph).toHaveLength(2);
    expect(enviado).not.toContain('Ejemplo');
    expect(enviado).not.toContain('40832310');
  });

  it('no informa las ventas del local ni de redes: no son compras del sitio', async () => {
    await informarTransferenciaPagadaAMeta(construir({ ...ORDEN_TRANSFERENCIA, channel: 'LOCAL' }) as never, 'o-1');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('no informa una compra de prueba', async () => {
    await informarTransferenciaPagadaAMeta(construir({ ...ORDEN_TRANSFERENCIA, isTest: true }) as never, 'o-1');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('no informa una compra hecha con un mail de prueba aunque la orden no esté marcada', async () => {
    const prisma = construir(ORDEN_TRANSFERENCIA);
    prisma.siteSection.findUnique.mockImplementation(async ({ where }: { where: { key: string } }) =>
      where.key === 'cuentas_prueba'
        ? { data: { emails: ['cliente@ejemplo.com'] } }
        : { data: { pixelId: '1041282918808105', accessToken: 'token' } },
    );
    await informarTransferenciaPagadaAMeta(prisma as never, 'o-1');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('no informa las de Mercado Pago: esas ya se informan al acreditarse el pago', async () => {
    const mp = { ...ORDEN_TRANSFERENCIA, notes: JSON.stringify({ paymentMethod: 'mercadopago' }) };
    await informarTransferenciaPagadaAMeta(construir(mp) as never, 'o-1');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
