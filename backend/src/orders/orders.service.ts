import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { PricingService } from '../pricing/pricing.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private pricing: PricingService,
  ) {}

  async findAll() {
    const orders = await this.prisma.order.findMany({
      include: { items: { include: { product: true, variant: true } }, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map(order => {
      let buyerInfo: any = {};
      try { buyerInfo = order.notes ? JSON.parse(order.notes) : {}; } catch {}
      return {
        ...order,
        buyerName: buyerInfo.buyerName || order.user?.name || null,
        buyerEmail: buyerInfo.buyerEmail || order.user?.email || null,
        buyerPhone: buyerInfo.buyerPhone || null,
        paymentMethod: buyerInfo.paymentMethod || null,
      };
    });
  }

  findByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true, variant: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true, variant: true } }, user: { select: { id: true, name: true, email: true } } },
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  async trackByNumber(number: string, email?: string, phone?: string) {
    const order = await this.prisma.order.findUnique({
      where: { number },
      include: { items: { include: { product: true, variant: true } }, user: { select: { id: true, name: true, email: true } } },
    });
    if (!order) throw new NotFoundException('Pedido no encontrado. Verifica el número de orden.');

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
        throw new NotFoundException('El teléfono no coincide con el pedido.');
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
    
    // S3 / F6 - Precios desde la base y verificación de stock. La misma lógica
    // que usa el checkout de Mercado Pago, para que ambos caminos coincidan.
    const resolvedItems = await this.pricing.resolveItems(
      dto.items.map((item) => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity })),
    );

    // El descuento es atómico: dos compras simultáneas de la última unidad no
    // pueden prosperar las dos.
    await this.pricing.decrementStock(resolvedItems);

    const itemsWithRealPrices = resolvedItems.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
    }));

    const subtotal = itemsWithRealPrices.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const total = subtotal + (dto.shipping || 0) - (dto.discount || 0);

    const buyerInfo = {
      buyerEmail: dto.buyerEmail || null,
      buyerPhone: dto.buyerPhone || null,
      buyerName: dto.buyerName || null,
    };

    const order = await this.prisma.order.create({
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
        items: { create: itemsWithRealPrices },
      },
      include: { items: { include: { product: true, variant: true } }, user: { select: { id: true, name: true, email: true } } },
    });

    const customerEmail = dto.buyerEmail || order.user?.email;
    if (customerEmail) {
      const itemsForEmail = order.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      }));
      this.emailService.sendOrderConfirmation(customerEmail, number, buyerInfo.buyerName || order.user?.name || 'Cliente', itemsForEmail, total).catch(err =>
        console.error('Error enviando email de confirmacion:', err.message)
      );
    }

    return order;
  }

  async updateStatus(id: string, status: OrderStatus, trackingNumber?: string, trackingUrl?: string) {
    await this.findOne(id);

    const data: any = { status };
    if (trackingNumber) data.trackingNumber = trackingNumber;
    if (trackingUrl) data.trackingUrl = trackingUrl;

    const updated = await this.prisma.order.update({ where: { id }, data });

    if (status === 'SHIPPED') {
      const order = await this.prisma.order.findUnique({
        where: { id },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      if (order) {
        let buyerInfo: any = {};
        try { buyerInfo = order.notes ? JSON.parse(order.notes) : {}; } catch {}
        const customerEmail = buyerInfo.buyerEmail || order.user?.email;

        if (customerEmail) {
          const tracking = trackingNumber || order.trackingNumber || 'Pendiente';
          const url = trackingUrl || order.trackingUrl || null;
          this.emailService.sendOrderShipped(customerEmail, order.number, buyerInfo.buyerName || order.user?.name || 'Cliente', tracking, url).catch(err =>
            console.error('Error enviando email de despacho:', err.message)
          );
        }
      }
    }

    return updated;
  }
}