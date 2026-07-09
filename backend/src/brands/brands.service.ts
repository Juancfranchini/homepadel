import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import slugify from 'slugify';

function normalizeDto(dto: any): any {
  const { isActive, logoUrl, logo, ...rest } = dto;
  if (isActive !== undefined) rest.active = isActive;
  const finalLogo = logoUrl || logo;
  if (finalLogo !== undefined) rest.logo = finalLogo;
  return rest;
}

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.brand.findMany({ orderBy: { name: 'asc' } }); }

  create(dto: any) {
    const data = normalizeDto(dto);
    const slug = slugify(data.name, { lower: true, strict: true });
    return this.prisma.brand.create({ data: { ...data, slug } });
  }

  async update(id: string, dto: any) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException('Marca no encontrada');
    const data = normalizeDto(dto);
    if (data.name) data.slug = slugify(data.name, { lower: true, strict: true });
    return this.prisma.brand.update({ where: { id }, data });
  }

  async remove(id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException('Marca no encontrada');
    return this.prisma.brand.delete({ where: { id } });
  }
}
