// Servicio de marcas
// El slug se genera automáticamente a partir del nombre con slugify

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import slugify from 'slugify';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.brand.findMany({ orderBy: { name: 'asc' } }); }

  create(dto: any) {
    const slug = slugify(dto.name, { lower: true, strict: true });
    return this.prisma.brand.create({ data: { ...dto, slug } });
  }

  async update(id: string, dto: any) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException('Marca no encontrada');
    const data: any = { ...dto };
    if (dto.name) data.slug = slugify(dto.name, { lower: true, strict: true });
    return this.prisma.brand.update({ where: { id }, data });
  }

  async remove(id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException('Marca no encontrada');
    return this.prisma.brand.delete({ where: { id } });
  }
}
