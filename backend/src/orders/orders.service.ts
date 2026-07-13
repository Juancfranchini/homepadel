import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  async trackByNumber(number: string, email?: string, phone?: string) {
    const order = await this.prisma.order.findUnique({
      where: { number },
      include: { items: { include: { product: true } }, user: { select: { id: true, name: true, email: true } } },
    });
    if (!order) throw new NotFoundException('Pedido no encontrado. Verifica el numero de orden.');

    if (email || phone) {
      let buyerInfo: any = {};
      try { buyerInfo = order.notes ? JSON.parse(order.notes) : {}; } catch {}

      if (email) {
        const orderEmail = buyerInfo.buyerEmail?.toLowerCase();
        const userEmail = order.user?.email?.toLowerCase();
        if (orderEmail !== email.toLowerCase() && userEmail !== email.toLowerCase()) {
          throw new NotFoundException('El email no coincide con el pedido.');
        }
      }
      if (phone && buyerInfo.buyerPhone !== phone) {
        throw new NotFoundException('El telefono no coincide con el pedido.');
      }
    }

    const { userId, user, notes, ...rest } = order as any;
    let buyerInfo: any = {};
    try { buyerInfo = notes ? JSON.parse(notes) : {}; } catch {}

    return {
      ...rest,
      buyerEmail: buyerInfo.buyerEmail || user?.email || null,
      buyerPhone: buyerInfo.buyerPhone || null,
      buyerName: buyerInfo.buyerName || user?.name || null,
      hasAccount: !!userId,
    };
  }

  async create(dto: CreateOrderDto, userId?: string) {
    const number = 'HP-' + Date.now();
    const subtotal = dto.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const total = subtotal + (dto.shipping || 0) - (dto.discount || 0);

    const buyerInfo = {
      buyerEmail: dto.buyerEmail || null,
      buyerPhone: dto.buyerPhone || null,
      buyerName: dto.buyerName || null,
    };

    return this.prisma.order.create({
      data: {
        number,
        userId: userId || null,
        address: dto.address,
        subtotal,
        total,
        shipping: dto.shipping || 0,
        discount: dto.discount || 0,
        couponCode: dto.couponCode,
        notes: JSON.stringify(buyerInfo),
        items: { create: dto.items },
      },
      include: { items: { include: { product: true } } },
    });
  }

  async updateStatus(id: string, status: OrderStatus) {
    await this.findOne(id);
    return this.prisma.order.update({ where: { id }, data: { status } });
  }
}
