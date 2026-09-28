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

/**
 * Los días se cuentan en hora argentina, no en UTC: una visita a las 22 hs
 * del lunes en UTC ya es martes, y el gráfico la mostraba en el día que no
 * era. Argentina no tiene horario de verano, así que el desfase es fijo.
 */
const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';
const DESFASE_ARGENTINA = '-03:00';
const UN_DIA_MS = 86400000;

/** Fecha YYYY-MM-DD de ese instante en Argentina. */
export function fechaArgentina(instante: Date): string {
  // en-CA da el formato YYYY-MM-DD directamente.
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_HORARIA }).format(instante);
}

/**
 * Los últimos `days` días en Argentina, del más viejo a hoy inclusive.
 * Antes la serie arrancaba en "ahora menos N días" y cortaba ayer: todo lo
 * de hoy quedaba afuera del gráfico aunque sí se sumaba en los totales, y el
 * día que se lanzó el seguimiento el gráfico salió plano.
 */
export function ultimosDias(days: number, ahora: Date = new Date()): string[] {
  const fechas: string[] = [];
  for (let i = days - 1; i >= 0; i--) fechas.push(fechaArgentina(new Date(ahora.getTime() - i * UN_DIA_MS)));
  return fechas;
}

@Injectable()
export class MarketingService {
  constructor(private prisma: PrismaService) {}

  async getStats(days: number) {
    const fechas = ultimosDias(days);
    // Desde las 0 hs del primer día: así los totales y el gráfico cuentan
    // exactamente los mismos eventos.
    const since = new Date(fechas[0] + 'T00:00:00' + DESFASE_ARGENTINA);
    const [funnel, daily, topViewed, topAddedToCart, registrandoDesde] = await Promise.all([
      this.getFunnelCounts(since),
      this.getDailyBreakdown(since, fechas),
      this.getTopProducts('ViewContent', since),
      this.getTopProducts('AddToCart', since),
      this.getPrimerEvento(),
    ]);
    return { funnel, conversion: this.getConversionRates(funnel), daily, topViewed, topAddedToCart, registrandoDesde };
  }

  /**
   * Desde cuándo hay datos. Antes de esa fecha el seguimiento no existía: los
   * días en cero no son "no hubo visitas", y compararlos con Meta engaña.
   */
  private async getPrimerEvento(): Promise<Date | null> {
    const primero = await this.prisma.marketingEvent.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    });
    return primero?.createdAt ?? null;
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
  private async getDailyBreakdown(since: Date, fechas: string[]): Promise<ConteoDiario[]> {
    const eventos = await this.prisma.marketingEvent.findMany({
      where: { createdAt: { gte: since }, eventName: { in: [...EVENTOS_EMBUDO] } },
      select: { eventName: true, createdAt: true },
    });

    const porDia = new Map<string, ConteoDiario>();
    for (const fecha of fechas) {
      porDia.set(fecha, { date: fecha, pageView: 0, viewContent: 0, addToCart: 0, initiateCheckout: 0, purchase: 0 });
    }

    for (const evento of eventos) {
      const fila = porDia.get(fechaArgentina(evento.createdAt));
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
