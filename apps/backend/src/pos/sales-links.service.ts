import { BadRequestException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SalesChannel } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { CreateSalesLinkDto } from './dto/saved-cart.dto';

interface LinkItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

@Injectable()
export class SalesLinksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
  ) {}

  async create(dto: CreateSalesLinkDto, sellerId: string) {
    const remoteChannels = new Set<SalesChannel>([
      SalesChannel.WHATSAPP,
      SalesChannel.INSTAGRAM,
      SalesChannel.SOCIAL,
      SalesChannel.PHONE,
    ]);
    if (!remoteChannels.has(dto.channel)) {
      throw new BadRequestException('Elegí un canal de venta remota');
    }
    await this.pricing.resolveItems(dto.items);
    const token = randomBytes(24).toString('base64url');
    const link = await this.prisma.salesCheckoutLink.create({
      data: {
        token,
        channel: dto.channel,
        branchId: dto.branchId || null,
        sellerId,
        items: dto.items as unknown as Prisma.InputJsonValue,
        customer: dto.customer as unknown as Prisma.InputJsonValue,
        notes: dto.notes,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    const frontend = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    return { ...link, checkoutUrl: `${frontend}/venta/${token}` };
  }

  async list(sellerId: string) {
    const links = await this.prisma.salesCheckoutLink.findMany({
      where: { sellerId },
      include: { order: { select: { id: true, number: true, paymentStatus: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const frontend = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    return links.map((link) => ({ ...link, checkoutUrl: `${frontend}/venta/${link.token}` }));
  }

  async publicDetail(token: string) {
    const link = await this.prisma.salesCheckoutLink.findUnique({ where: { token } });
    if (!link) throw new NotFoundException('El enlace de venta no existe');
    if (link.expiresAt < new Date() || link.status === 'EXPIRED') {
      await this.prisma.salesCheckoutLink.updateMany({
        where: { id: link.id, status: { in: ['OPEN', 'CHECKOUT'] } },
        data: { status: 'EXPIRED' },
      });
      throw new GoneException('El enlace de venta venció');
    }
    if (link.status === 'CONVERTED') {
      return { status: link.status, orderId: link.orderId, items: [] };
    }
    const requested = link.items as unknown as LinkItem[];
    const resolved = await this.pricing.resolveItems(requested);
    const productIds = requested.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true, brand: true, variants: true },
    });
    return {
      status: link.status,
      token: link.token,
      channel: link.channel,
      customer: link.customer,
      items: requested.map((item) => ({
        ...item,
        product: products.find((product) => product.id === item.productId),
        price: resolved.find(
          (resolvedItem) =>
            resolvedItem.productId === item.productId && resolvedItem.variantId === item.variantId,
        )?.price,
      })),
    };
  }
}
