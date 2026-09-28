import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { effectivePrice } from '../pricing/effective-price';

/** Productos marcados con el corazón. Solo cuentan los productos activos. */
@Injectable()
export class FavoritosService {
  constructor(private prisma: PrismaService) {}

  async ids(userId: string): Promise<string[]> {
    const favoritos = await this.prisma.favorite.findMany({
      where: { userId, product: { active: true } },
      select: { productId: true },
    });
    return favoritos.map((f) => f.productId);
  }

  async listar(userId: string) {
    const favoritos = await this.prisma.favorite.findMany({
      where: { userId, product: { active: true } },
      orderBy: { createdAt: 'desc' },
      include: { product: { include: { category: true, brand: true, variants: true } } },
    });
    return favoritos.map(({ product }) => ({ ...product, effectivePrice: effectivePrice(product.price, product.salePrice) }));
  }

  async agregar(userId: string, productId: string) {
    const producto = await this.prisma.product.findFirst({ where: { id: productId, active: true }, select: { id: true } });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    await this.prisma.favorite.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: {},
    });
    return { ok: true };
  }

  async quitar(userId: string, productId: string) {
    await this.prisma.favorite.deleteMany({ where: { userId, productId } });
    return { ok: true };
  }

  /** Suma los favoritos marcados sin sesión; ignora productos que ya no existen. */
  async sincronizar(userId: string, productIds: string[]): Promise<string[]> {
    const unicos = [...new Set(productIds)];
    if (unicos.length > 0) {
      const existentes = await this.prisma.product.findMany({ where: { id: { in: unicos }, active: true }, select: { id: true } });
      await this.prisma.favorite.createMany({
        data: existentes.map((p) => ({ userId, productId: p.id })),
        skipDuplicates: true,
      });
    }
    return this.ids(userId);
  }
}
