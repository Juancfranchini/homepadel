import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateReviewDto } from './dto/review.dto';

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

  /**
   * "Compra verificada" = esa cuenta tiene un pedido cobrado (no de prueba)
   * con ese producto, hecho con la cuenta o con su mail en el checkout.
   * Antes bastaba con tener la sesión iniciada, y el backoffice podía
   * tildarlo a mano: cualquier reseña inventada salía como verificada.
   */
  private async compraVerificada(userId: string, productId: string): Promise<boolean> {
    const usuario = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    const pedido = await this.prisma.order.findFirst({
      where: {
        status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
        isTest: false,
        items: { some: { productId } },
        OR: [
          { userId },
          ...(usuario?.email ? [{ notes: { contains: '"buyerEmail":"' + usuario.email + '"', mode: 'insensitive' as const } }] : []),
        ],
      },
      select: { id: true },
    });
    return !!pedido;
  }

  async create(dto: { productId: string; name: string; rating: number; comment: string; userId: string }) {
    // Una reseña por persona y producto: varias de la misma cuenta inflaban el promedio.
    const previa = await this.prisma.productReview.findFirst({ where: { productId: dto.productId, userId: dto.userId }, select: { id: true } });
    if (previa) throw new BadRequestException('Ya dejaste una reseña de este producto.');
    return this.prisma.productReview.create({
      data: {
        productId: dto.productId,
        name: dto.name,
        rating: dto.rating,
        comment: dto.comment,
        userId: dto.userId,
        verified: await this.compraVerificada(dto.userId, dto.productId),
        // Moderada: se publica recién cuando la tienda la aprueba.
        active: false,
      },
    });
  }

  async approve(id: string) {
    const review = await this.prisma.productReview.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review no encontrada');
    return this.prisma.productReview.update({ where: { id }, data: { active: true } });
  }

  async update(id: string, dto: UpdateReviewDto) {
    const review = await this.prisma.productReview.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review no encontrada');
    // "Verificada" no se edita a mano: lo decide la compra (ver compraVerificada).
    const { verified: _ignorado, ...datos } = dto;
    return this.prisma.productReview.update({ where: { id }, data: datos });
  }

  async remove(id: string) {
    const review = await this.prisma.productReview.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review no encontrada');
    return this.prisma.productReview.delete({ where: { id } });
  }
}
