// S3 / F6 — Resolución de precios y control de stock
//
// El checkout tiene dos caminos (orden directa y Mercado Pago) y ambos tienen
// que calcular lo mismo: cuánto vale realmente cada producto y si hay unidades
// disponibles. Tenerlo en un único lugar evita que una corrección futura vuelva
// a cubrir solo la mitad del recorrido.
//
// Regla de oro: del cliente se acepta QUÉ quiere comprar y CUÁNTAS unidades.
// El precio sale siempre de la base de datos.

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RequestedItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface ResolvedItem {
  productId: string;
  variantId?: string;
  name: string;
  quantity: number;
  price: number;
}

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Toma los ítems que llegaron del navegador y devuelve la versión confiable:
   * precio tomado de la base y stock verificado. Descarta cualquier precio que
   * venga en la petición.
   */
  async resolveItems(items: RequestedItem[]): Promise<ResolvedItem[]> {
    if (!Array.isArray(items) || items.length === 0) {
      throw new ConflictException('El pedido no tiene productos');
    }

    return Promise.all(
      items.map(async (item) => {
        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new ConflictException('Cantidad inválida en el pedido');
        }

        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            name: true, price: true, salePrice: true, stock: true, active: true,
            variants: {
              where: item.variantId ? { id: item.variantId } : undefined,
              select: { id: true, stock: true, active: true },
            },
          },
        });

        if (!product) {
          throw new NotFoundException(`El producto ${item.productId} no existe`);
        }
        if (!product.active) {
          throw new ConflictException(`"${product.name}" ya no está disponible`);
        }
        if (product.variants.length > 0 && !item.variantId) {
          throw new ConflictException(`Debes seleccionar una variante de "${product.name}"`);
        }
        const variant = item.variantId ? product.variants[0] : null;
        if (item.variantId && !variant) {
          throw new NotFoundException(`La variante ${item.variantId} no pertenece al producto`);
        }
        if (variant && !variant.active) {
          throw new ConflictException(`La variante de "${product.name}" ya no está disponible`);
        }
        const availableStock = variant ? variant.stock : product.stock;
        if (availableStock < quantity) {
          throw new ConflictException(
            `Quedan ${availableStock} unidades de "${product.name}" y pediste ${quantity}`,
          );
        }

        return {
          productId: item.productId,
          variantId: item.variantId,
          name: product.name,
          quantity,
          price: this.effectivePrice(product.price, product.salePrice),
        };
      }),
    );
  }

  /**
   * Descuenta stock de forma atómica. La condición `stock >= quantity` viaja
   * dentro del propio UPDATE, así dos compras simultáneas de la última unidad
   * no pueden pasar las dos: la segunda no afecta ninguna fila y se rechaza.
   */
  async decrementStock(items: ResolvedItem[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const result = item.variantId
        ? await tx.productVariant.updateMany({
             where: { id: item.variantId, productId: item.productId, stock: { gte: item.quantity }, active: true },
             data: { stock: { decrement: item.quantity } },
           })
        : await tx.product.updateMany({
             where: { id: item.productId, stock: { gte: item.quantity }, active: true },
             data: { stock: { decrement: item.quantity } },
           });

        if (result.count === 0) {
          throw new ConflictException(`Sin stock suficiente de "${item.name}"`);
        }
      }
    });
  }

  /** Precio vigente: el promocional solo si es válido y menor al de lista. */
  private effectivePrice(price: number, salePrice: number | null): number {
    const hasValidSale = salePrice != null && salePrice > 0 && salePrice < price;
    return hasValidSale ? salePrice : price;
  }
}
