import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentOrders = await this.prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, status: { not: 'CANCELLED' } },
      include: { items: { include: { product: true } } },
    });

    const allOrders = await this.prisma.order.findMany({
      where: { status: { not: 'CANCELLED' } },
      include: { items: { include: { product: true } } },
    });

    const ventas30 = recentOrders.reduce((acc, o) => acc + o.total, 0);
    const totalPedidos = allOrders.length;
    const ticketPromedio = recentOrders.length > 0 ? ventas30 / recentOrders.length : 0;
    const ganancia = ventas30 * 0.3;

    const productSales: Record<string, { name: string; units: number; revenue: number }> = {};
    allOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const productName = item.product?.name || 'Producto eliminado';
        if (!productSales[productName]) {
          productSales[productName] = { name: productName, units: 0, revenue: 0 };
        }
        productSales[productName].units += item.quantity;
        productSales[productName].revenue += item.quantity * item.price;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.units - a.units)
      .slice(0, 5)
      .map((p, index) => ({ ...p, rank: index + 1 }));

    const recentOrdersList = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: { select: { name: true } } },
    });

    return {
      kpis: { ventas30, totalPedidos, ticketPromedio, ganancia },
      recentOrders: recentOrdersList.map((o) => ({
        id: o.id,
        number: o.number,
        customer: o.user?.name || 'Invitado',
        total: o.total,
        status: o.status,
        date: o.createdAt,
      })),
      topProducts,
      productsSoldCount: Object.values(productSales).reduce((acc, p) => acc + p.units, 0),
      activeUsers: await this.prisma.user.count(),
      newUsers30: await this.prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      productsStats: {
        total: await this.prisma.product.count(),
        active: await this.prisma.product.count({ where: { active: true } }),
        outOfStock: await this.prisma.product.count({ where: { stock: 0, isMadeToOrder: false } }),
        lowStock: await this.prisma.product.count({ where: { stock: { gt: 0, lte: 5 }, isMadeToOrder: false } }),
        madeToOrder: await this.prisma.product.count({ where: { isMadeToOrder: true } }),
      },
      ordersByStatus: {
        PENDING: await this.prisma.order.count({ where: { status: 'PENDING' } }),
        PAID: await this.prisma.order.count({ where: { status: 'PAID' } }),
        SHIPPED: await this.prisma.order.count({ where: { status: 'SHIPPED' } }),
        DELIVERED: await this.prisma.order.count({ where: { status: 'DELIVERED' } }),
        CANCELLED: await this.prisma.order.count({ where: { status: 'CANCELLED' } }),
      },
      reviewsStats: {
        total: await this.prisma.productReview.count(),
        pending: await this.prisma.productReview.count({ where: { active: false } }),
        avgRating: await this.prisma.productReview.aggregate({ _avg: { rating: true } }).then(r => Math.round((r._avg.rating || 0) * 10) / 10),
      },
      marketingStats: {
        newsletterSubscribers: await this.prisma.newsletter.count({ where: { active: true } }),
        activePromotions: await this.prisma.promotion.count({ where: { active: true } }),
        activeCoupons: await this.prisma.coupon.count({ where: { active: true } }),
      },
    };
  }
}