import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SizeGuidesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.sizeGuide.findMany({
      where: { active: true },
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllAdmin() {
    return this.prisma.sizeGuide.findMany({
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const guide = await this.prisma.sizeGuide.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    if (!guide) throw new NotFoundException('Guia no encontrada');
    return guide;
  }

  findByCategory(categoryId: string) {
    return this.prisma.sizeGuide.findMany({
      where: { categoryId, active: true },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
  }

  create(dto: any) {
    return this.prisma.sizeGuide.create({
      data: {
        name: dto.name,
        categoryId: dto.categoryId,
        content: dto.content || '',
        productIds: dto.productIds || [],
        active: dto.active ?? true,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
  }

  async update(id: string, dto: any) {
    const guide = await this.prisma.sizeGuide.findUnique({ where: { id } });
    if (!guide) throw new NotFoundException('Guia no encontrada');
    return this.prisma.sizeGuide.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.productIds !== undefined && { productIds: dto.productIds }),
        ...(dto.active !== undefined && { active: dto.active }),
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
  }

  async remove(id: string) {
    const guide = await this.prisma.sizeGuide.findUnique({ where: { id } });
    if (!guide) throw new NotFoundException('Guia no encontrada');
    return this.prisma.sizeGuide.delete({ where: { id } });
  }
}
