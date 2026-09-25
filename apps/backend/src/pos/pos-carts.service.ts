import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SaveCartDto } from './dto/saved-cart.dto';

@Injectable()
export class PosCartsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.savedCart.findMany({
      where: { userId, status: 'SAVED' },
      include: { branch: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  create(dto: SaveCartDto, userId: string) {
    if (dto.items.length === 0) throw new BadRequestException('El carrito está vacío');
    return this.prisma.savedCart.create({
      data: {
        name: dto.name,
        channel: dto.channel,
        branchId: dto.branchId || null,
        userId,
        items: dto.items as unknown as Prisma.InputJsonValue,
        customer: dto.customer as unknown as Prisma.InputJsonValue,
        discountType: dto.discountType,
        discountValue: dto.discountValue ?? 0,
        shipping: dto.shipping ?? 0,
        notes: dto.notes,
      },
    });
  }

  async remove(id: string, userId: string) {
    const result = await this.prisma.savedCart.updateMany({
      where: { id, userId, status: 'SAVED' },
      data: { status: 'CANCELLED' },
    });
    if (result.count === 0) throw new NotFoundException('Carrito guardado no encontrado');
    return { success: true };
  }
}
