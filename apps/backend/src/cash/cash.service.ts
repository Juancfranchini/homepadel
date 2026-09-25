import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CashMovementType, PaymentKind, PaymentMethod } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CashEntryDto, CloseCashSessionDto, OpenCashSessionDto } from './dto/cash.dto';

type Totals = Record<string, number>;

@Injectable()
export class CashService {
  constructor(private readonly prisma: PrismaService) {}

  async open(dto: OpenCashSessionDto, userId: string) {
    const existing = await this.prisma.cashSession.findFirst({
      where: { registerId: dto.registerId, status: 'OPEN' },
    });
    if (existing) throw new ConflictException('Esta caja ya tiene una apertura activa');
    return this.prisma.cashSession.create({
      data: {
        registerId: dto.registerId,
        openedById: userId,
        openingAmount: dto.openingAmount,
        notes: dto.notes,
        movements: {
          create: {
            userId,
            type: CashMovementType.OPENING,
            method: PaymentMethod.CASH,
            amount: dto.openingAmount,
            note: 'Fondo inicial',
          },
        },
      },
      include: { register: { include: { branch: true } }, movements: true },
    });
  }

  current(registerId?: string) {
    return this.prisma.cashSession.findFirst({
      where: { status: 'OPEN', ...(registerId ? { registerId } : {}) },
      include: {
        register: { include: { branch: true } },
        movements: { orderBy: { createdAt: 'desc' } },
        payments: { where: { status: 'CONFIRMED' } },
        orders: { select: { id: true, number: true, total: true, paymentStatus: true } },
      },
      orderBy: { openedAt: 'desc' },
    });
  }

  async movement(dto: CashEntryDto, userId: string) {
    if (dto.type !== CashMovementType.INCOME && dto.type !== CashMovementType.WITHDRAWAL) {
      throw new BadRequestException('Sólo se permiten ingresos o retiros manuales');
    }
    const session = await this.prisma.cashSession.findFirst({
      where: { id: dto.cashSessionId, status: 'OPEN' },
    });
    if (!session) throw new ConflictException('La caja no está abierta');
    const amount = dto.type === CashMovementType.WITHDRAWAL ? -dto.amount : dto.amount;
    return this.prisma.cashMovement.create({
      data: {
        cashSessionId: dto.cashSessionId,
        userId,
        type: dto.type,
        method: PaymentMethod.CASH,
        amount,
        note: dto.note,
      },
    });
  }

  async summary(id: string) {
    const session = await this.prisma.cashSession.findUnique({
      where: { id },
      include: { payments: { where: { status: 'CONFIRMED' } }, movements: true },
    });
    if (!session) throw new NotFoundException('Caja no encontrada');
    const byMethod: Totals = {};
    for (const payment of session.payments) {
      const signed = payment.kind === PaymentKind.REFUND ? -payment.amount : payment.amount;
      byMethod[payment.method] = (byMethod[payment.method] ?? 0) + signed;
    }
    const manualCash = session.movements
      .filter(
        (movement) =>
          movement.type === CashMovementType.INCOME ||
          movement.type === CashMovementType.WITHDRAWAL,
      )
      .reduce((sum, movement) => sum + movement.amount, 0);
    return {
      expected: {
        ...byMethod,
        CASH: session.openingAmount + (byMethod.CASH ?? 0) + manualCash,
      },
      sales: session.payments
        .filter((payment) => payment.kind === PaymentKind.CHARGE)
        .reduce((sum, payment) => sum + payment.amount, 0),
      movements: session.movements,
    };
  }

  async close(id: string, dto: CloseCashSessionDto, userId: string) {
    const session = await this.prisma.cashSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Caja no encontrada');
    if (session.status !== 'OPEN') throw new ConflictException('La caja ya está cerrada');
    const { expected } = await this.summary(id);
    const counted = this.normalizeTotals(dto.countedTotals);
    const methods = new Set([...Object.keys(expected), ...Object.keys(counted)]);
    const differences = Object.fromEntries(
      [...methods].map((method) => [method, (counted[method] ?? 0) - (expected[method] ?? 0)]),
    );
    return this.prisma.$transaction(async (tx) => {
      const closed = await tx.cashSession.update({
        where: { id },
        data: {
          status: 'CLOSED',
          closedById: userId,
          closedAt: new Date(),
          expectedTotals: expected,
          countedTotals: counted,
          differences,
          notes: dto.notes || session.notes,
        },
        include: { register: { include: { branch: true } }, movements: true, orders: true },
      });
      await tx.auditLog.create({
        data: {
          actorId: userId,
          entityType: 'CashSession',
          entityId: id,
          action: 'CLOSED',
          changes: { expected, counted, differences },
        },
      });
      return closed;
    });
  }

  history() {
    return this.prisma.cashSession.findMany({
      where: { status: 'CLOSED' },
      include: {
        register: { include: { branch: true } },
        openedBy: { select: { id: true, name: true } },
        closedBy: { select: { id: true, name: true } },
      },
      orderBy: { closedAt: 'desc' },
      take: 100,
    });
  }

  private normalizeTotals(input: Record<string, number>): Totals {
    const allowed = new Set(Object.values(PaymentMethod));
    const entries = Object.entries(input).map(([method, value]) => {
      const amount = Number(value);
      if (!allowed.has(method as PaymentMethod) || !Number.isFinite(amount) || amount < 0) {
        throw new BadRequestException('Los importes contados no son válidos');
      }
      return [method, amount] as const;
    });
    return Object.fromEntries(entries);
  }
}
