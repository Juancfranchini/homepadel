// Servicio de pedidos
// El número de pedido se genera automáticamente: HP-{timestamp}
// El total se calcula como: subtotal + shipping - discount
// El subtotal se calcula sumando price * quantity de cada item

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.order.findMany({
      include: { user: { select: { id: true, name: true, email: true } }, items: { include: { product: true } } },
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
      include: { user: { select: { id: true, name: true, email: true } }, items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  async create(dto: CreateOrderDto, userId: string) {
    const number = `HP-${Date.now()}`;
    const subtotal = dto.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const total = subtotal + (dto.shipping || 0) - (dto.discount || 0);

    return this.prisma.order.create({
      data: {
        number,
        userId,
        address: dto.address,
        subtotal,
        total,
        shipping: dto.shipping || 0,
        discount: dto.discount || 0,
        couponCode: dto.couponCode,
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
