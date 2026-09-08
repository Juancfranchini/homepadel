import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function normalizeDto(dto: any): any {
  const { isActive, ...rest } = dto;
  if (isActive !== undefined) rest.active = isActive;
  return rest;
}

@Injectable()
export class BenefitsService {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.benefit.findMany({ where: { active: true }, orderBy: { order: 'asc' } }); }
  findAllAdmin() { return this.prisma.benefit.findMany({ orderBy: { order: 'asc' } }); }

  create(dto: any) { return this.prisma.benefit.create({ data: normalizeDto(dto) }); }

  async update(id: string, dto: any) {
    const item = await this.prisma.benefit.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Beneficio no encontrado');
    return this.prisma.benefit.update({ where: { id }, data: normalizeDto(dto) });
  }

  async remove(id: string) {
    const item = await this.prisma.benefit.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Beneficio no encontrado');
    return this.prisma.benefit.delete({ where: { id } });
  }
}
