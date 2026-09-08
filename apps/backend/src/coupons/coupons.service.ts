// Servicio de cupones
// validate: verifica que el cupón sea válido (activo, no expirado, con usos disponibles)
// Los tipos de cupón son: PERCENTAGE (porcentaje) | FIXED (monto fijo)

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function normalizeDto(dto: any): any {
  const { isActive, expiresAt, ...rest } = dto;
  if (isActive !== undefined) rest.active = isActive;
  if (expiresAt) rest.expiresAt = new Date(expiresAt);
  return rest;
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

  /** Monto de descuento para un subtotal dado. Nunca deja el total negativo. */
  calculateDiscount(coupon: { type: string; discount: number }, subtotal: number): number {
    const raw = coupon.type === 'FIXED' ? coupon.discount : (subtotal * coupon.discount) / 100;
    return Math.min(Math.round(raw), subtotal);
  }

  incrementUsage(id: string) {
    return this.prisma.coupon.update({ where: { id }, data: { usedCount: { increment: 1 } } });
  }

  create(dto: any) { return this.prisma.coupon.create({ data: normalizeDto(dto) }); }

  async update(id: string, dto: any) {
    const c = await this.prisma.coupon.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Cupón no encontrado');
    return this.prisma.coupon.update({ where: { id }, data: normalizeDto(dto) });
  }

  async remove(id: string) {
    const c = await this.prisma.coupon.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Cupón no encontrado');
    return this.prisma.coupon.delete({ where: { id } });
  }
}
