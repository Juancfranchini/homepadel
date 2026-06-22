import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FaqService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.fAQ.findMany({ where: { active: true }, orderBy: { order: 'asc' } });
  }

  findAllAdmin() {
    return this.prisma.fAQ.findMany({ orderBy: { order: 'asc' } });
  }

  create(dto: any) {
    return this.prisma.fAQ.create({ data: dto });
  }

  async update(id: string, dto: any) {
    const item = await this.prisma.fAQ.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('FAQ no encontrada');
    return this.prisma.fAQ.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const item = await this.prisma.fAQ.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('FAQ no encontrada');
    return this.prisma.fAQ.delete({ where: { id } });
  }
}