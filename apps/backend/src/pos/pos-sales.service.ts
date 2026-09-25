import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InventoryStatus, Prisma, Role } from '@prisma/client';
import { InventoryService } from '../inventory/inventory.service';
import { POS_PERMISSIONS } from '../common/permissions';
import { PrismaService } from '../prisma/prisma.service';
import { effectivePrice } from '../pricing/effective-price';
import { PricingService, ResolvedItem } from '../pricing/pricing.service';
import { CreatePosSaleDto, RegisterPosPaymentDto } from './dto/pos-sale.dto';
import { CreateBranchDto, CreateCashRegisterDto } from './dto/pos-settings.dto';
import { calculateSaleTotal } from './pos.calculations';
import { PosPaymentsService } from './pos-payments.service';

export interface PosActor {
  id: string;
  role: Role;
  permissions: string[];
}

@Injectable()
export class PosSalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
    private readonly inventory: InventoryService,
    private readonly posPayments: PosPaymentsService,
  ) {}

  async catalog(search = '') {
    const term = search.trim();
    const products = await this.prisma.product.findMany({
      where: {
        active: true,
        ...(term
          ? {
              OR: [
                { name: { contains: term, mode: 'insensitive' as const } },
                { sku: { contains: term, mode: 'insensitive' as const } },
                { barcode: term },
                {
                  variants: {
                    some: {
                      active: true,
                      OR: [
                        { sku: { contains: term, mode: 'insensitive' as const } },
                        { barcode: term },
                      ],
                    },
                  },
                },
              ],
            }
          : {}),
      },
      include: { category: true, brand: true, variants: { where: { active: true } } },
      orderBy: { name: 'asc' },
      take: 30,
    });
    return products.map((product) => ({
      ...product,
      effectivePrice: effectivePrice(product.price, product.salePrice),
    }));
  }

  customers(search = '') {
    return this.prisma.user.findMany({
      where: {
        role: Role.CUSTOMER,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: { id: true, name: true, email: true, phone: true, address: true },
      orderBy: { name: 'asc' },
      take: 20,
    });
  }

  sellers() {
    return this.prisma.user.findMany({
      where: { role: { in: [Role.ADMIN, Role.STAFF] } },
      select: { id: true, name: true, role: true },
      orderBy: { name: 'asc' },
    });
  }

  config() {
    return this.prisma.branch.findMany({
      where: { active: true },
      include: { registers: { where: { active: true }, orderBy: { name: 'asc' } } },
      orderBy: { name: 'asc' },
    });
  }

  createBranch(dto: CreateBranchDto, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const branch = await tx.branch.create({
        data: { ...dto, code: dto.code.trim().toUpperCase() },
      });
      await tx.auditLog.create({
        data: {
          actorId,
          entityType: 'Branch',
          entityId: branch.id,
          action: 'CREATED',
          changes: { name: branch.name, code: branch.code },
        },
      });
      return branch;
    });
  }

  createRegister(dto: CreateCashRegisterDto, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const register = await tx.cashRegister.create({
        data: { ...dto, code: dto.code.trim().toUpperCase() },
      });
      await tx.auditLog.create({
        data: {
          actorId,
          entityType: 'CashRegister',
          entityId: register.id,
          action: 'CREATED',
          changes: { name: register.name, code: register.code, branchId: register.branchId },
        },
      });
      return register;
    });
  }

  async createSale(dto: CreatePosSaleDto, actor: PosActor) {
    this.assertDiscountPermission(dto, actor);
    const resolved = await this.pricing.resolveItems(dto.items);
    const subtotal = resolved.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totals = calculateSaleTotal(
      subtotal,
      dto.shipping ?? 0,
      dto.discountType,
      dto.discountValue,
    );
    const number = `POS-${Date.now()}`;

    return this.prisma.$transaction(async (tx) => {
      await this.assertCashSessionBranch(tx, dto.cashSessionId, dto.branchId);
      const customerId = await this.resolveCustomer(tx, dto);
      const order = await this.createOrder(
        tx,
        dto,
        actor,
        resolved,
        subtotal,
        totals,
        number,
        customerId,
      );
      return this.completeSale(tx, dto, actor, resolved, order, number, totals.total);
    });
  }

  private createOrder(
    tx: Prisma.TransactionClient,
    dto: CreatePosSaleDto,
    actor: PosActor,
    resolved: ResolvedItem[],
    subtotal: number,
    totals: { discount: number; total: number },
    number: string,
    customerId: string | null,
  ) {
    return tx.order.create({
      data: {
        number,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        inventoryStatus: resolved.some((item) => !item.isMadeToOrder)
          ? InventoryStatus.DEDUCTED
          : InventoryStatus.NONE,
        channel: dto.channel,
        source: dto.source || null,
        userId: customerId,
        sellerId: actor.id,
        createdById: actor.id,
        updatedById: actor.id,
        branchId: dto.branchId,
        cashSessionId: dto.cashSessionId || null,
        subtotal,
        total: totals.total,
        shipping: dto.shipping ?? 0,
        discount: totals.discount,
        address: dto.customer?.address || 'Retiro en local',
        notes: JSON.stringify({
          note: dto.notes || null,
          buyerName: dto.customer?.name || null,
          buyerEmail: dto.customer?.email || null,
          buyerPhone: dto.customer?.phone || null,
          discountType: dto.discountType || null,
          discountValue: dto.discountValue || 0,
        }),
        soldAt: new Date(),
        items: {
          create: resolved.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });
  }

  private async completeSale(
    tx: Prisma.TransactionClient,
    dto: CreatePosSaleDto,
    actor: PosActor,
    resolved: ResolvedItem[],
    order: { id: string; total: number },
    number: string,
    total: number,
  ) {
    await this.inventory.deductWithClient(tx, resolved, {
      orderId: order.id,
      branchId: dto.branchId,
      userId: actor.id,
      reason: `Venta ${number}`,
    });
    const payment = await this.posPayments.recordWithClient(
      tx,
      order,
      dto.payments,
      actor.id,
      dto.cashSessionId,
    );
    const completed = payment.status === 'PAID';
    const updated = await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: payment.status,
        status: completed ? 'PAID' : 'PENDING',
        paidAt: completed ? new Date() : null,
      },
      include: { items: { include: { product: true, variant: true } }, payments: true },
    });
    if (dto.savedCartId) {
      await tx.savedCart.updateMany({
        where: { id: dto.savedCartId, status: 'SAVED' },
        data: { status: 'CONVERTED', convertedOrderId: order.id },
      });
    }
    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        entityType: 'Order',
        entityId: order.id,
        action: 'POS_SALE_CREATED',
        changes: { channel: dto.channel, total, paymentStatus: payment.status },
      },
    });
    return updated;
  }

  async addPayment(orderId: string, dto: RegisterPosPaymentDto, actor: PosActor) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new NotFoundException('Venta no encontrada');
      await this.assertCashSessionBranch(tx, dto.cashSessionId, order.branchId);
      const result = await this.posPayments.recordWithClient(
        tx,
        order,
        dto.payments,
        actor.id,
        dto.cashSessionId,
      );
      const completed = result.status === 'PAID';
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: result.status,
          status: completed ? 'PAID' : order.status,
          paidAt: completed ? new Date() : order.paidAt,
          updatedById: actor.id,
        },
        include: { payments: true },
      });
      if (completed) {
        await tx.salesCheckoutLink.updateMany({
          where: { orderId },
          data: { status: 'CONVERTED' },
        });
      }
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          entityType: 'Order',
          entityId: orderId,
          action: 'PAYMENT_REGISTERED',
          changes: { amount: dto.payments.reduce((sum, item) => sum + item.amount, 0) },
        },
      });
      return updated;
    });
  }

  private assertDiscountPermission(dto: CreatePosSaleDto, actor: PosActor): void {
    if (!dto.discountValue || actor.role === Role.ADMIN) return;
    if (!actor.permissions.includes(POS_PERMISSIONS.DISCOUNT)) {
      throw new ForbiddenException('No tenés permiso para aplicar descuentos');
    }
  }

  private async assertCashSessionBranch(
    tx: Prisma.TransactionClient,
    cashSessionId?: string,
    branchId?: string | null,
  ) {
    if (!cashSessionId) return;
    const session = await tx.cashSession.findFirst({
      where: { id: cashSessionId, status: 'OPEN' },
      select: { register: { select: { branchId: true } } },
    });
    if (!session) throw new ConflictException('La caja seleccionada no está abierta');
    if (branchId && session.register.branchId !== branchId) {
      throw new ConflictException('La caja abierta pertenece a otra sucursal');
    }
  }

  private async resolveCustomer(tx: Prisma.TransactionClient, dto: CreatePosSaleDto) {
    if (dto.customerId) {
      const customer = await tx.user.findUnique({
        where: { id: dto.customerId },
        select: { id: true },
      });
      if (!customer) throw new NotFoundException('Cliente no encontrado');
      return customer.id;
    }
    if (!dto.customer?.email) return null;
    const existing = await tx.user.findFirst({
      where: { email: { equals: dto.customer.email, mode: 'insensitive' } },
      select: { id: true },
    });
    if (existing) return existing.id;
    const created = await tx.user.create({
      data: { ...dto.customer, email: dto.customer.email.toLowerCase(), role: Role.CUSTOMER },
      select: { id: true },
    });
    return created.id;
  }
}
