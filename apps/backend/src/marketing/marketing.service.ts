import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const EVENTOS_EMBUDO = ['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'] as const;
type EventoEmbudo = (typeof EVENTOS_EMBUDO)[number];

export interface ConteoDiario {
  date: string;
  pageView: number;
  viewContent: number;
  addToCart: number;
  initiateCheckout: number;
  purchase: number;
}

const CAMPO_POR_EVENTO: Record<EventoEmbudo, keyof Omit<ConteoDiario, 'date'>> = {
  PageView: 'pageView',
  ViewContent: 'viewContent',
  AddToCart: 'addToCart',
  InitiateCheckout: 'initiateCheckout',
  Purchase: 'purchase',
};

@Injectable()
export class MarketingService {
  constructor(private prisma: PrismaService) {}

  async getStats(days: number) {
    const since = new Date(Date.now() - days * 86400000);
    const [funnel, daily, topViewed, topAddedToCart] = await Promise.all([
      this.getFunnelCounts(since),
      this.getDailyBreakdown(since, days),
      this.getTopProducts('ViewContent', since),
      this.getTopProducts('AddToCart', since),
    ]);
    return { funnel, conversion: this.getConversionRates(funnel), daily, topViewed, topAddedToCart };
  }

  private async getFunnelCounts(since: Date): Promise<Record<EventoEmbudo, number>> {
    const counts = await Promise.all(
      EVENTOS_EMBUDO.map((eventName) =>
        this.prisma.marketingEvent.count({ where: { eventName, createdAt: { gte: since } } }),
      ),
    );
    return Object.fromEntries(EVENTOS_EMBUDO.map((eventName, i) => [eventName, counts[i]])) as Record<
      EventoEmbudo,
      number
    >;
  }

  /**
   * Conversión entre pasos consecutivos del embudo, y de principio a fin.
   * Nunca división por cero: sin datos en el paso anterior, la conversión es 0.
   */
  private getConversionRates(funnel: Record<EventoEmbudo, number>) {
    const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 1000) / 10 : 0);
    return {
      viewContentDePageView: pct(funnel.ViewContent, funnel.PageView),
      addToCartDeViewContent: pct(funnel.AddToCart, funnel.ViewContent),
      checkoutDeAddToCart: pct(funnel.InitiateCheckout, funnel.AddToCart),
      compraDeCheckout: pct(funnel.Purchase, funnel.InitiateCheckout),
      compraDePageView: pct(funnel.Purchase, funnel.PageView),
    };
  }

  /** Un punto por día en el rango, con 0 en los días sin eventos — para que el gráfico no tenga huecos. */
  private async getDailyBreakdown(since: Date, days: number): Promise<ConteoDiario[]> {
    const eventos = await this.prisma.marketingEvent.findMany({
      where: { createdAt: { gte: since }, eventName: { in: [...EVENTOS_EMBUDO] } },
      select: { eventName: true, createdAt: true },
    });

    const porDia = new Map<string, ConteoDiario>();
    for (let i = 0; i < days; i++) {
      const fecha = new Date(since.getTime() + i * 86400000).toISOString().slice(0, 10);
      porDia.set(fecha, { date: fecha, pageView: 0, viewContent: 0, addToCart: 0, initiateCheckout: 0, purchase: 0 });
    }

    for (const evento of eventos) {
      const fecha = evento.createdAt.toISOString().slice(0, 10);
      const fila = porDia.get(fecha);
      const campo = CAMPO_POR_EVENTO[evento.eventName as EventoEmbudo];
      if (fila && campo) fila[campo] += 1;
    }

    return [...porDia.values()];
  }

  /** Qué productos generan más interés, para ese paso puntual del embudo. */
  private async getTopProducts(eventName: 'ViewContent' | 'AddToCart', since: Date, limite = 10) {
    const grupos = await this.prisma.marketingEvent.groupBy({
      by: ['productId'],
      where: { eventName, productId: { not: null }, createdAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limite,
    });
    if (grupos.length === 0) return [];

    // El último nombre *conocido*: hay eventos que llegan sin nombre (los
    // agregados al carrito anteriores a que se mandara), y no deben tapar uno bueno.
    const ids = grupos.map((g) => g.productId as string);
    const nombres = await this.prisma.marketingEvent.findMany({
      where: { productId: { in: ids }, productName: { not: null } },
      distinct: ['productId'],
      orderBy: { createdAt: 'desc' },
      select: { productId: true, productName: true },
    });
    const nombrePorId = new Map(nombres.map((n) => [n.productId, n.productName]));

    return grupos.map((g) => ({
      productId: g.productId as string,
      productName: nombrePorId.get(g.productId as string) || 'Producto sin nombre',
      count: g._count.id,
    }));
  }
}
