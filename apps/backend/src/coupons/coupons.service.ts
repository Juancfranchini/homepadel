// Servicio de cupones
// validate: verifica que el cupón sea válido (activo, no expirado, con usos disponibles)
// Los tipos de cupón son: PERCENTAGE (porcentaje) | FIXED (monto fijo)

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';

/** Del DTO validado a los datos de Prisma: `isActive` es el nombre viejo de `active`. */
function datosDelCupon(dto: UpdateCouponDto): Prisma.CouponUpdateInput {
  const { isActive, expiresAt, ...resto } = dto;
  return {
    ...resto,
    ...(resto.code ? { code: resto.code.trim().toUpperCase() } : {}),
    ...(isActive !== undefined && resto.active === undefined ? { active: isActive } : {}),
    ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}),
  };
}

/** Un porcentaje mayor a 100 regalaría el pedido: depende del tipo, por eso no está en el DTO. */
function chequearPorcentaje(type: string | undefined, discount: number | undefined): void {
  if (type === 'PERCENTAGE' && discount !== undefined && discount > 100) {
    throw new BadRequestException('Un cupón de porcentaje no puede superar el 100%');
  }
}

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }); }

  /**
   * P2 — Único lugar que decide si un cupón vale. `subtotal`, si se pasa,
   * también valida el monto mínimo — antes no se chequeaba pese a existir
   * en el modelo.
   */
  async validate(code: string, subtotal?: number) {
    if (!code) throw new BadRequestException('Cupón inválido o inactivo');
    const coupon = await this.prisma.coupon.findFirst({ where: { code: { equals: code, mode: 'insensitive' } } });
    if (!coupon || !coupon.active) throw new BadRequestException('Cupón inválido o inactivo');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new BadRequestException('Cupón expirado');
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new BadRequestException('Cupón sin usos disponibles');
    if (coupon.minAmount && subtotal !== undefined && subtotal < coupon.minAmount) {
      throw new BadRequestException(`Cupón válido a partir de $${coupon.minAmount}`);
    }
    return coupon;
  }

  /**
   * Monto de descuento para un subtotal dado. Nunca deja el total negativo y
   * respeta el tope en pesos (`maxDiscount`) si el cupón lo tiene. Es el
   * mismo cálculo para el carrito, el checkout y lo que se cobra.
   */
  calculateDiscount(coupon: { type: string; discount: number; maxDiscount?: number | null }, subtotal: number): number {
    const raw = coupon.type === 'FIXED' ? coupon.discount : (subtotal * coupon.discount) / 100;
    const conTope = coupon.maxDiscount && coupon.maxDiscount > 0 ? Math.min(raw, coupon.maxDiscount) : raw;
    return Math.min(Math.round(conTope), subtotal);
  }

  incrementUsage(id: string) {
    return this.prisma.coupon.update({ where: { id }, data: { usedCount: { increment: 1 } } });
  }

  create(dto: CreateCouponDto) {
    chequearPorcentaje(dto.type, dto.discount);
    return this.prisma.coupon.create({ data: datosDelCupon(dto) as Prisma.CouponCreateInput });
  }

  async update(id: string, dto: UpdateCouponDto) {
    const c = await this.prisma.coupon.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Cupón no encontrado');
    chequearPorcentaje(dto.type ?? c.type, dto.discount ?? c.discount);
    return this.prisma.coupon.update({ where: { id }, data: datosDelCupon(dto) });
  }

  async remove(id: string) {
    const c = await this.prisma.coupon.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Cupón no encontrado');
    return this.prisma.coupon.delete({ where: { id } });
  }
}
