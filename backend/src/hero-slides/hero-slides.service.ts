import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function normalizeDto(dto: any): any {
  const { isActive, ...rest } = dto;
  if (isActive !== undefined) rest.active = isActive;
  return rest;
}

@Injectable()
export class HeroSlidesService {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.heroSlide.findMany({ where: { active: true }, orderBy: { order: 'asc' } }); }
  findAllAdmin() { return this.prisma.heroSlide.findMany({ orderBy: { order: 'asc' } }); }

  create(dto: any) { return this.prisma.heroSlide.create({ data: normalizeDto(dto) }); }

  async update(id: string, dto: any) {
    const slide = await this.prisma.heroSlide.findUnique({ where: { id } });
    if (!slide) throw new NotFoundException('Slide no encontrado');
    return this.prisma.heroSlide.update({ where: { id }, data: normalizeDto(dto) });
  }

  async remove(id: string) {
    const slide = await this.prisma.heroSlide.findUnique({ where: { id } });
    if (!slide) throw new NotFoundException('Slide no encontrado');
    return this.prisma.heroSlide.delete({ where: { id } });
  }
}
