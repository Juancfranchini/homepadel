import { AbandonedCartsService } from './abandoned-carts.service';

const HORA = 60 * 60 * 1000;

function construir(existente: { recoveredAt: Date | null } | null = null) {
  const prisma = {
    abandonedCart: {
      findUnique: jest.fn().mockResolvedValue(existente),
      upsert: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    siteSection: { findUnique: jest.fn().mockResolvedValue(null) },
  };
  const pricing = {
    resolveItems: jest.fn().mockResolvedValue([
      { productId: 'p-1', variantId: null, name: 'Paleta', quantity: 1, price: 450000 },
    ]),
  };
  return { prisma, service: new AbandonedCartsService(prisma as never, pricing as never) };
}

const CARRITO = { email: 'Cliente@Gmail.com', name: 'Cliente', items: [{ productId: 'p-1', quantity: 1 }] };

describe('AbandonedCartsService.save', () => {
  it('guarda el carrito con el precio de la base y el mail normalizado', async () => {
    const { prisma, service } = construir();
    await service.save(CARRITO);
    const llamada = prisma.abandonedCart.upsert.mock.calls[0][0];
    expect(llamada.where).toEqual({ email: 'cliente@gmail.com' });
    expect(llamada.create).toMatchObject({ total: 450000, isTest: false });
  });

  it('si esa persona compró hace rato y arma otro carrito, vuelve a la lista como abandono nuevo', async () => {
    const { prisma, service } = construir({ recoveredAt: new Date(Date.now() - 3 * HORA) });
    await service.save(CARRITO);
    expect(prisma.abandonedCart.upsert.mock.calls[0][0].update).toMatchObject({
      recoveredAt: null,
      orderNumber: null,
      contactedAt: null,
    });
  });

  it('un guardado que llega justo después de pagar no reabre el carrito recuperado', async () => {
    const { prisma, service } = construir({ recoveredAt: new Date(Date.now() - 60 * 1000) });
    await service.save(CARRITO);
    expect(prisma.abandonedCart.upsert.mock.calls[0][0].update).not.toHaveProperty('recoveredAt');
  });

  it('un carrito de una cuenta de prueba queda marcado', async () => {
    const { prisma, service } = construir();
    prisma.siteSection.findUnique.mockResolvedValue({ data: { emails: ['cliente@gmail.com'] } });
    await service.save(CARRITO);
    expect(prisma.abandonedCart.upsert.mock.calls[0][0].create).toMatchObject({ isTest: true });
  });

  it('una cuenta de prueba con sesión que escribe otro mail en el checkout también queda marcada', async () => {
    const { prisma, service } = construir();
    prisma.siteSection.findUnique.mockResolvedValue({ data: { emails: ['prueba@homepadel.com.ar'] } });
    await service.save(CARRITO, 'Prueba@HomePadel.com.ar');
    expect(prisma.abandonedCart.upsert.mock.calls[0][0].create).toMatchObject({ isTest: true });
  });
});

describe('AbandonedCartsService.markRecovered', () => {
  it('marca el carrito del mail del checkout y el de la cuenta, sin repetir', async () => {
    const { prisma, service } = construir();
    await service.markRecovered(['Cliente@Gmail.com', 'cuenta@gmail.com', 'cliente@gmail.com', null], 'HP-1');
    expect(prisma.abandonedCart.updateMany).toHaveBeenCalledWith({
      where: { email: { in: ['cliente@gmail.com', 'cuenta@gmail.com'] }, recoveredAt: null },
      data: { recoveredAt: expect.any(Date), orderNumber: 'HP-1' },
    });
  });

  it('sin mails no toca la base', async () => {
    const { prisma, service } = construir();
    await service.markRecovered([undefined, null], 'HP-1');
    expect(prisma.abandonedCart.updateMany).not.toHaveBeenCalled();
  });
});

describe('AbandonedCartsService.stats', () => {
  it('suma el embudo real (inicios de checkout y compras), no solo los que dejaron contacto', async () => {
    const prisma = {
      abandonedCart: {
        count: jest.fn().mockResolvedValueOnce(5).mockResolvedValueOnce(1),
        aggregate: jest.fn().mockResolvedValue({ _sum: { total: 2850000 } }),
      },
      marketingEvent: {
        aggregate: jest.fn().mockResolvedValue({ _count: { id: 19 }, _sum: { value: 9500000 } }),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    const service = new AbandonedCartsService(prisma as never, {} as never);
    const stats = await service.stats();
    expect(stats).toMatchObject({ pendientes: 5, recuperados: 1, montoPendiente: 2850000, iniciosCheckout: 19, montoIniciado: 9500000, compras: 0 });
    expect(prisma.marketingEvent.aggregate).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ eventName: 'InitiateCheckout' }) }));
  });
});
