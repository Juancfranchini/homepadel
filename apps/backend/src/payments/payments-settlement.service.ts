import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Prisma, User } from '@prisma/client';
import { AbandonedCartsService } from '../abandoned-carts/abandoned-carts.service';
import { hashPassword } from '../common/security/password';
import { InventoryService } from '../inventory/inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import { enviarCompraAMeta } from './payments.meta';

interface ApprovedPayment {
  id: string | number;
  status: string;
  external_reference?: string;
  transaction_amount?: number;
  date_approved?: string;
  payer?: { email?: string; first_name?: string };
}

interface PendingOrder {
  id: string;
  number: string;
  userId: string | null;
  couponCode: string | null;
  total: number;
  notes: string | null;
  branchId: string | null;
  sellerId: string | null;
  items: {
    productId: string;
    variantId: string | null;
    quantity: number;
    price: number;
    product: { name: string };
  }[];
}

@Injectable()
export class PaymentsSettlementService {
  private readonly logger = new Logger(PaymentsSettlementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
    private readonly abandonedCarts: AbandonedCartsService,
  ) {}

  async settle(payment: ApprovedPayment, frontendUrl: string): Promise<'registrado' | 'ya-estaba'> {
    const paymentId = String(payment.id);
    const [registeredPayment, legacyOrder] = await Promise.all([
      this.prisma.payment.findUnique({ where: { externalId: paymentId } }),
      this.prisma.order.findFirst({ where: { notes: { contains: paymentId } } }),
    ]);
    if (registeredPayment?.status === 'CONFIRMED' || legacyOrder) return 'ya-estaba';

    const email = payment.payer?.email || '';
    const name = payment.payer?.first_name || 'Cliente MP';
    const user = await this.resolveUser(email, name);
    const order = payment.external_reference
      ? await this.prisma.order.findFirst({
          where: { notes: { contains: payment.external_reference } },
          include: { items: { include: { product: { select: { name: true } } } } },
        })
      : null;

    if (order) await this.settleOrder(order, payment, user, email, name, paymentId);
    else await this.createFallback(payment, user, email, name);
    await enviarCompraAMeta(this.prisma, {
      payment,
      orderNumber: order?.number || `HP-${Date.now()}`,
      items:
        order?.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })) ?? [],
      email,
      frontendUrl,
    });
    return 'registrado';
  }

  parseNotes(notes: string | null): Record<string, unknown> {
    if (!notes) return {};
    try {
      const parsed = JSON.parse(notes);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      this.logger.warn('No se pudo leer el JSON de `notes` de una orden.');
      return {};
    }
  }

  private async resolveUser(email: string, name: string): Promise<User | null> {
    if (!email) return null;
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) return existing;
    const password = await hashPassword(randomBytes(32).toString('base64url'));
    return this.prisma.user.create({ data: { email, name, password, role: 'CUSTOMER' } });
  }

  private async settleOrder(
    order: PendingOrder,
    payment: ApprovedPayment,
    user: User | null,
    email: string,
    name: string,
    paymentId: string,
  ) {
    const notes = this.parseNotes(order.notes);
    try {
      await this.writeSettlement(order, payment, user, email, name, paymentId, notes, true);
    } catch (error) {
      if (!(error instanceof ConflictException)) throw error;
      this.logger.error(`Pago ${paymentId} aprobado sin stock para ${order.number}: ${error}`);
      await this.writeSettlement(order, payment, user, email, name, paymentId, notes, false);
    }
    this.abandonedCarts.markRecovered((notes.buyerEmail as string) || email, order.number);
    this.logger.log(`Orden ${order.number} marcada como pagada.`);
  }

  private async writeSettlement(
    order: PendingOrder,
    payment: ApprovedPayment,
    user: User | null,
    email: string,
    name: string,
    paymentId: string,
    notes: Record<string, unknown>,
    deductInventory: boolean,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.payment.findUnique({ where: { externalId: paymentId } });
      if (existing?.status === 'CONFIRMED') return;
      if (deductInventory) {
        await this.inventory.deductWithClient(tx, this.inventoryItems(order), {
          orderId: order.id,
          branchId: order.branchId || undefined,
          userId: order.sellerId || undefined,
          reason: `Pago confirmado ${order.number}`,
        });
      }
      if (order.couponCode) {
        await tx.coupon.updateMany({
          where: { code: { equals: order.couponCode, mode: 'insensitive' } },
          data: { usedCount: { increment: 1 } },
        });
      }
      const now = new Date();
      await tx.order.update({
        where: { id: order.id },
        data: this.orderUpdate(order, payment, user, email, name, notes, deductInventory, now),
      });
      await tx.payment.upsert({
        where: { externalId: paymentId },
        update: { status: 'CONFIRMED' },
        create: {
          orderId: order.id,
          method: 'MERCADOPAGO',
          status: 'CONFIRMED',
          amount: payment.transaction_amount || order.total,
          externalId: paymentId,
          reference: payment.external_reference || null,
          receivedAt: payment.date_approved ? new Date(payment.date_approved) : now,
        },
      });
      await tx.salesCheckoutLink.updateMany({
        where: { orderId: order.id },
        data: { status: 'CONVERTED' },
      });
    });
  }

  private inventoryItems(order: PendingOrder) {
    return order.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId ?? undefined,
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
    }));
  }

  private orderUpdate(
    order: PendingOrder,
    payment: ApprovedPayment,
    user: User | null,
    email: string,
    name: string,
    notes: Record<string, unknown>,
    deductInventory: boolean,
    now: Date,
  ): Prisma.OrderUpdateInput {
    return {
      status: 'PAID',
      paymentStatus: 'PAID',
      inventoryStatus: deductInventory ? 'DEDUCTED' : 'NONE',
      user: user ? { connect: { id: user.id } } : undefined,
      total: payment.transaction_amount || order.total,
      paidAt: now,
      soldAt: now,
      notes: JSON.stringify({
        ...notes,
        pendingPayment: false,
        paymentId: payment.id,
        paymentMethod: 'mercadopago',
        paymentStatus: payment.status,
        buyerEmail: notes.buyerEmail || email,
        buyerName: notes.buyerName || name,
        stockIncident: !deductInventory,
      }),
    };
  }

  private async createFallback(
    payment: ApprovedPayment,
    user: User | null,
    email: string,
    name: string,
  ) {
    const subtotal = payment.transaction_amount || 0;
    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          number: `HP-${Date.now()}`,
          userId: user?.id || null,
          status: 'PAID',
          paymentStatus: 'PAID',
          channel: 'ONLINE',
          paidAt: new Date(),
          soldAt: new Date(),
          total: subtotal,
          subtotal,
          shipping: 0,
          discount: 0,
          address: 'Compra via Mercado Pago',
          notes: JSON.stringify({ paymentId: payment.id, buyerEmail: email, buyerName: name }),
        },
      });
      await tx.payment.create({
        data: {
          orderId: order.id,
          method: 'MERCADOPAGO',
          amount: subtotal,
          externalId: String(payment.id),
          reference: payment.external_reference || null,
        },
      });
    });
  }
}
