import { MarketingService, fechaArgentina, ultimosDias } from './marketing.service';

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
      findFirst: jest.fn(async () => {
        const ordenados = [...eventos].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        return ordenados[0] ? { createdAt: ordenados[0].createdAt } : null;
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

  it('informa desde cuándo hay datos, aunque el primer evento quede fuera del rango pedido', async () => {
    const hace60Dias = new Date(Date.now() - 60 * 86400000);
    const service = construirServicio([
      { eventName: 'PageView', createdAt: HACE_1_DIA },
      { eventName: 'PageView', createdAt: hace60Dias },
    ]);
    const stats = await service.getStats(30);

    expect(stats.registrandoDesde).toEqual(hace60Dias);
  });

  it('sin ningún evento todavía, no inventa una fecha de inicio', async () => {
    const stats = await construirServicio([]).getStats(30);
    expect(stats.registrandoDesde).toBeNull();
  });

  it('arma un punto por día en el rango, con 0 en los días sin eventos', async () => {
    const service = construirServicio([{ eventName: 'PageView', createdAt: HACE_1_DIA }]);
    const stats = await service.getStats(7);

    expect(stats.daily).toHaveLength(7);
    expect(stats.daily.every((dia) => typeof dia.date === 'string')).toBe(true);
    const totalPageViews = stats.daily.reduce((acc, dia) => acc + dia.pageView, 0);
    expect(totalPageViews).toBe(1);
  });

  it('lo que pasó hoy aparece en el último punto del gráfico', async () => {
    const service = construirServicio([
      { eventName: 'PageView', createdAt: new Date() },
      { eventName: 'PageView', createdAt: new Date() },
      { eventName: 'ViewContent', createdAt: new Date() },
    ]);
    const stats = await service.getStats(30);

    const hoy = stats.daily[stats.daily.length - 1];
    expect(hoy.date).toBe(fechaArgentina(new Date()));
    expect(hoy.pageView).toBe(2);
    expect(hoy.viewContent).toBe(1);
    // Totales y gráfico cuentan lo mismo.
    expect(stats.daily.reduce((acc, dia) => acc + dia.pageView, 0)).toBe(stats.funnel.PageView);
  });
});

describe('fechas del gráfico', () => {
  it('cuenta el día en hora argentina, no en UTC', () => {
    // 01:30 UTC del martes = 22:30 del lunes en Argentina.
    expect(fechaArgentina(new Date('2026-09-29T01:30:00Z'))).toBe('2026-09-28');
    expect(fechaArgentina(new Date('2026-09-29T03:00:00Z'))).toBe('2026-09-29');
  });

  it('los últimos N días terminan hoy, sin saltear ni repetir', () => {
    const dias = ultimosDias(30, new Date('2026-09-27T23:47:00Z'));
    expect(dias).toHaveLength(30);
    expect(dias[0]).toBe('2026-08-29');
    expect(dias[29]).toBe('2026-09-27');
    expect(new Set(dias).size).toBe(30);
  });
});
