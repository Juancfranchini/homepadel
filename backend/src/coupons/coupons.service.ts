// Servicio de cupones
// validate: verifica que el cupón sea válido (activo, no expirado, con usos disponibles)
// Los tipos de cupón son: PERCENTAGE (porcentaje) | FIXED (monto fijo)

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }); }

  async validate(code: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.active) throw new BadRequestException('Cupón inválido o inactivo');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new BadRequestException('Cupón expirado');
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new BadRequestException('Cupón sin usos disponibles');
    return coupon;
  }

  create(dto: any) { return this.prisma.coupon.create({ data: dto }); }

  async update(id: string, dto: any) {
    const c = await this.prisma.coupon.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Cupón no encontrado');
    return this.prisma.coupon.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const c = await this.prisma.coupon.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Cupón no encontrado');
    return this.prisma.coupon.delete({ where: { id } });
  }
}
