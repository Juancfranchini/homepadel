// Servicio de banners
// El campo 'order' controla el orden de aparición en el slider del home
// Solo se retornan banners activos en findAll (para el frontend público)

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.banner.findMany({ where: { active: true }, orderBy: { order: 'asc' } }); }

  create(dto: any) { return this.prisma.banner.create({ data: dto }); }

  async update(id: string, dto: any) {
    const b = await this.prisma.banner.findUnique({ where: { id } });
    if (!b) throw new NotFoundException('Banner no encontrado');
    return this.prisma.banner.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const b = await this.prisma.banner.findUnique({ where: { id } });
    if (!b) throw new NotFoundException('Banner no encontrado');
    return this.prisma.banner.delete({ where: { id } });
  }
}
