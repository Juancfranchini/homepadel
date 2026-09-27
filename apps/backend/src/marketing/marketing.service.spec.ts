import { MarketingService } from './marketing.service';

function construirServicio(eventos: { eventName: string; productId?: string | null; productName?: string | null; createdAt: Date }[]) {
  const prisma = {
    marketingEvent: {
      count: jest.fn(async ({ where }: any) => {
        return eventos.filter(
          (e) => e.eventName === where.eventName && e.createdAt >= where.createdAt.gte,
        ).length;
      }),
      findMany: jest.fn(async ({ where, distinct, orderBy }: any) => {
        let filtrados = eventos.filter((e) => {
          if (where?.createdAt?.gte && e.createdAt < where.createdAt.gte) return false;
          if (where?.eventName?.in && !where.eventName.in.includes(e.eventName)) return false;
          if (where?.productId?.in && !where.productId.in.includes(e.productId)) return false;
          if (where?.productName?.not === null && !e.productName) return false;
          return true;
        });
        if (orderBy?.createdAt === 'desc') {
          filtrados = [...filtrados].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
        if (distinct?.includes('productId')) {
          const vistos = new Set<string>();
          filtrados = filtrados.filter((e) => {
            if (!e.productId || vistos.has(e.productId)) return false;
            vistos.add(e.productId);
            return true;
          });
        }
        return filtrados;
      }),
      groupBy: jest.fn(async ({ where, take }: any) => {
        const filtrados = eventos.filter(
          (e) => e.eventName === where.eventName && e.productId && e.createdAt >= where.createdAt.gte,
        );
        const conteos = new Map<string, number>();
        for (const e of filtrados) conteos.set(e.productId as string, (conteos.get(e.productId as string) || 0) + 1);
        return [...conteos.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, take)
          .map(([productId, count]) => ({ productId, _count: { id: count } }));
      }),
    },
  };
  return new MarketingService(prisma as any);
}

const HACE_1_DIA = new Date(Date.now() - 1 * 86400000);

describe('MarketingService.getStats', () => {
  it('sin ningún evento, todo el embudo y las conversiones quedan en 0 — nunca división por cero', async () => {
    const service = construirServicio([]);
    const stats = await service.getStats(30);

    expect(stats.funnel).toEqual({ PageView: 0, ViewContent: 0, AddToCart: 0, InitiateCheckout: 0, Purchase: 0 });
    expect(stats.conversion).toEqual({
      viewContentDePageView: 0,
      addToCartDeViewContent: 0,
      checkoutDeAddToCart: 0,
      compraDeCheckout: 0,
      compraDePageView: 0,
    });
  });

  it('calcula la conversión real entre pasos consecutivos', async () => {
    const eventos = [
      ...Array(100).fill(null).map(() => ({ eventName: 'PageView', createdAt: HACE_1_DIA })),
      ...Array(40).fill(null).map(() => ({ eventName: 'ViewContent', createdAt: HACE_1_DIA })),
      ...Array(10).fill(null).map(() => ({ eventName: 'AddToCart', createdAt: HACE_1_DIA })),
      ...Array(5).fill(null).map(() => ({ eventName: 'InitiateCheckout', createdAt: HACE_1_DIA })),
      ...Array(2).fill(null).map(() => ({ eventName: 'Purchase', createdAt: HACE_1_DIA })),
    ];
    const service = construirServicio(eventos);
    const stats = await service.getStats(30);

    expect(stats.funnel).toEqual({ PageView: 100, ViewContent: 40, AddToCart: 10, InitiateCheckout: 5, Purchase: 2 });
    expect(stats.conversion.viewContentDePageView).toBe(40);
    expect(stats.conversion.addToCartDeViewContent).toBe(25);
    expect(stats.conversion.checkoutDeAddToCart).toBe(50);
    expect(stats.conversion.compraDeCheckout).toBe(40);
    expect(stats.conversion.compraDePageView).toBe(2);
  });

  it('ignora eventos fuera del rango de fechas pedido', async () => {
    const hace60Dias = new Date(Date.now() - 60 * 86400000);
    const service = construirServicio([
      { eventName: 'PageView', createdAt: hace60Dias },
      { eventName: 'PageView', createdAt: HACE_1_DIA },
    ]);
    const stats = await service.getStats(30);

    expect(stats.funnel.PageView).toBe(1);
  });

  it('arma el ranking de productos más vistos, con el nombre más reciente de cada uno', async () => {
    const service = construirServicio([
      { eventName: 'ViewContent', productId: 'prod-1', productName: 'Paleta Vieja', createdAt: new Date(HACE_1_DIA.getTime() - 1000) },
      { eventName: 'ViewContent', productId: 'prod-1', productName: 'Paleta Nueva', createdAt: HACE_1_DIA },
      { eventName: 'ViewContent', productId: 'prod-2', productName: 'Paletero', createdAt: HACE_1_DIA },
    ]);
    const stats = await service.getStats(30);

    expect(stats.topViewed).toEqual([
      { productId: 'prod-1', productName: 'Paleta Nueva', count: 2 },
      { productId: 'prod-2', productName: 'Paletero', count: 1 },
    ]);
  });

  it('un evento reciente sin nombre no tapa el último nombre conocido del producto', async () => {
    const service = construirServicio([
      { eventName: 'ViewContent', productId: 'prod-1', productName: 'Adidas - Metalbone Reserve', createdAt: new Date(HACE_1_DIA.getTime() - 1000) },
      { eventName: 'AddToCart', productId: 'prod-1', productName: null, createdAt: HACE_1_DIA },
    ]);
    const stats = await service.getStats(30);

    expect(stats.topAddedToCart).toEqual([
      { productId: 'prod-1', productName: 'Adidas - Metalbone Reserve', count: 1 },
    ]);
  });

  it('sin productos vistos, el ranking queda vacío en vez de romper', async () => {
    const service = construirServicio([]);
    const stats = await service.getStats(30);

    expect(stats.topViewed).toEqual([]);
    expect(stats.topAddedToCart).toEqual([]);
  });

  it('arma un punto por día en el rango, con 0 en los días sin eventos', async () => {
    const service = construirServicio([{ eventName: 'PageView', createdAt: HACE_1_DIA }]);
    const stats = await service.getStats(7);

    expect(stats.daily).toHaveLength(7);
    expect(stats.daily.every((dia) => typeof dia.date === 'string')).toBe(true);
    const totalPageViews = stats.daily.reduce((acc, dia) => acc + dia.pageView, 0);
    expect(totalPageViews).toBe(1);
  });
});
