import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  findAll(productId?: string) {
    return this.prisma.productReview.findMany({
      where: { ...(productId ? { productId } : {}), active: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllAdmin() {
    return this.prisma.productReview.findMany({ include: { product: { select: { id: true, name: true, images: true } } }, orderBy: { createdAt: 'desc' } });
  }

  findByUser(userId: string) {
    return this.prisma.productReview.findMany({
      where: { userId },
      include: { product: { select: { id: true, name: true, slug: true, images: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: { productId: string; name: string; rating: number; comment: string; userId?: string }) {
    return this.prisma.productReview.create({
      data: {
        productId: dto.productId,
        name: dto.name,
        rating: dto.rating,
        comment: dto.comment,
        userId: dto.userId || null,
        verified: !!dto.userId,
        active: false,
      },
    });
  }

  async approve(id: string) {
    const review = await this.prisma.productReview.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review no encontrada');
    return this.prisma.productReview.update({ where: { id }, data: { active: true } });
  }

  async update(id: string, dto: any) {
    const review = await this.prisma.productReview.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review no encontrada');
    return this.prisma.productReview.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const review = await this.prisma.productReview.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review no encontrada');
    return this.prisma.productReview.delete({ where: { id } });
  }
}
