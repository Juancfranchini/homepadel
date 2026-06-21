import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function normalizeDto(dto: any): any {
  const { isActive, ...rest } = dto;
  if (isActive !== undefined) rest.active = isActive;
  return rest;
}

@Injectable()
export class TestimonialsService {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.testimonial.findMany({ where: { active: true }, orderBy: { order: 'asc' } }); }
  findAllAdmin() { return this.prisma.testimonial.findMany({ orderBy: { order: 'asc' } }); }

  create(dto: any) { return this.prisma.testimonial.create({ data: normalizeDto(dto) }); }

  createPublic(dto: any) {
    return this.prisma.testimonial.create({
      data: {
        name: dto.name,
        comment: dto.comment,
        rating: dto.rating || 5,
        active: false,
      },
    });
  }

  async approve(id: string) {
    const item = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Testimonio no encontrado');
    return this.prisma.testimonial.update({ where: { id }, data: { active: true } });
  }

  async update(id: string, dto: any) {
    const item = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Testimonio no encontrado');
    return this.prisma.testimonial.update({ where: { id }, data: normalizeDto(dto) });
  }

  async remove(id: string) {
    const item = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Testimonio no encontrado');
    return this.prisma.testimonial.delete({ where: { id } });
  }
}