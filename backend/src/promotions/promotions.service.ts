// Servicio de promociones
// Las promociones tienen startDate y endDate para controlar su vigencia

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.promotion.findMany({ orderBy: { startDate: 'desc' } }); }

  create(dto: any) { return this.prisma.promotion.create({ data: dto }); }

  async update(id: string, dto: any) {
    const p = await this.prisma.promotion.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Promoción no encontrada');
    return this.prisma.promotion.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const p = await this.prisma.promotion.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Promoción no encontrada');
    return this.prisma.promotion.delete({ where: { id } });
  }
}
