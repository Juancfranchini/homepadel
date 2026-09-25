import { Injectable } from '@nestjs/common';
import { PaymentKind, PaymentState, Prisma, SalesChannel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PosStatsQueryDto } from './dto/stats-query.dto';

export interface ProductMetric {
  productId: string;
  name: string;
  units: number;
  revenue: number;
}

interface ChannelOrder {
  channel: SalesChannel;
  total: number;
}

@Injectable()
export class PosStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(query: PosStatsQueryDto) {
    const range = this.range(query);
    const orderFilter = this.orderFilter(query);
    const orders = await this.prisma.order.findMany({
      where: { ...orderFilter, soldAt: range, status: { not: 'CANCELLED' } },
      include: {
        items: { include: { product: { select: { id: true, name: true } } } },
        seller: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true } },
      },
    });
    const refunds = await this.prisma.saleReturn.findMany({
      where: { createdAt: range, order: { ...orderFilter, status: { not: 'CANCELLED' } } },
      include: { order: { select: { channel: true } } },
    });
    const payments = await this.prisma.payment.findMany({
      where: {
        receivedAt: range,
        status: PaymentState.CONFIRMED,
        ...(query.paymentMethod ? { method: query.paymentMethod } : {}),
        order: orderFilter,
      },
    });

    const grossSales = orders.reduce((sum, order) => sum + order.total, 0);
    const refunded = refunds.reduce((sum, item) => sum + item.refundAmount, 0);
    const income = payments.reduce(
      (sum, payment) =>
        sum + (payment.kind === PaymentKind.REFUND ? -payment.amount : payment.amount),
      0,
    );
    const units = orders.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    );

    return {
      criteria: {
        sales:
          'Fecha de venta (soldAt), incluye envío y descuentos; excluye canceladas y resta devoluciones.',
        income: 'Fecha de cobro (receivedAt), sólo cobros confirmados menos reintegros.',
      },
      totals: {
        grossSales,
        refunds: refunded,
        netSales: grossSales - refunded,
        income,
        operations: orders.length,
        units,
        averageTicket: orders.length ? grossSales / orders.length : 0,
      },
      byChannel: this.byChannel(orders, refunds),
      byPaymentMethod: this.byPaymentMethod(payments),
      daily: this.daily(orders),
      topProducts: this.topProducts(orders),
    };
  }

  private range(query: PosStatsQueryDto): Prisma.DateTimeFilter {
    const from = new Date(query.from);
    const to = new Date(query.to);
    if (/^\d{4}-\d{2}-\d{2}$/.test(query.to)) to.setUTCHours(23, 59, 59, 999);
    return { gte: from, lte: to };
  }

  private orderFilter(query: PosStatsQueryDto): Prisma.OrderWhereInput {
    return {
      ...(query.channel ? { channel: query.channel } : {}),
      ...(query.branchId ? { branchId: query.branchId } : {}),
      ...(query.sellerId ? { sellerId: query.sellerId } : {}),
      ...(query.paymentMethod
        ? {
            payments: { some: { method: query.paymentMethod, status: PaymentState.CONFIRMED } },
          }
        : {}),
    };
  }

  private byChannel(
    orders: ChannelOrder[],
    refunds: { refundAmount: number; order: { channel: SalesChannel } }[],
  ) {
    const channels = Object.values(SalesChannel);
    return channels.map((channel) => {
      const channelOrders = orders.filter((order) => order.channel === channel);
      const channelRefunds = refunds
        .filter((item) => item.order.channel === channel)
        .reduce((sum, item) => sum + item.refundAmount, 0);
      const gross = channelOrders.reduce((sum, order) => sum + order.total, 0);
      return {
        channel,
        gross,
        refunds: channelRefunds,
        net: gross - channelRefunds,
        operations: channelOrders.length,
      };
    });
  }

  private byPaymentMethod(payments: { method: string; kind: PaymentKind; amount: number }[]) {
    const values = new Map<string, number>();
    for (const payment of payments) {
      const signed = payment.kind === PaymentKind.REFUND ? -payment.amount : payment.amount;
      values.set(payment.method, (values.get(payment.method) ?? 0) + signed);
    }
    return [...values].map(([method, amount]) => ({ method, amount }));
  }

  private daily(orders: { soldAt: Date | null; total: number }[]) {
    const values = new Map<string, { sales: number; operations: number }>();
    for (const order of orders) {
      if (!order.soldAt) continue;
      const day = order.soldAt.toISOString().slice(0, 10);
      const current = values.get(day) ?? { sales: 0, operations: 0 };
      values.set(day, { sales: current.sales + order.total, operations: current.operations + 1 });
    }
    return [...values]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, ...value }));
  }

  private topProducts(
    orders: {
      items: {
        productId: string;
        quantity: number;
        price: number;
        product: { id: string; name: string };
      }[];
    }[],
  ): ProductMetric[] {
    const metrics = new Map<string, ProductMetric>();
    for (const order of orders) {
      for (const item of order.items) {
        const current = metrics.get(item.productId) ?? {
          productId: item.productId,
          name: item.product.name,
          units: 0,
          revenue: 0,
        };
        current.units += item.quantity;
        current.revenue += item.price * item.quantity;
        metrics.set(item.productId, current);
      }
    }
    return [...metrics.values()].sort((a, b) => b.units - a.units).slice(0, 10);
  }
}
