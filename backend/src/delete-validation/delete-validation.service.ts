import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeleteValidationService {
  constructor(private prisma: PrismaService) {}

  async checkBrandDependencies(brandId: string) {
    const products = await this.prisma.product.findMany({
      where: { brandId },
      include: {
        reviews: true,
        orderItems: true,
      },
    });

    const reviewCount = products.reduce((acc, p) => acc + p.reviews.length, 0);
    const orderItemCount = products.reduce((acc, p) => acc + p.orderItems.length, 0);

    return {
      productCount: products.length,
      reviewCount,
      orderItemCount,
      hasOrders: orderItemCount > 0,
      requiresConfirmation: products.length > 0,
    };
  }

  async checkCategoryDependencies(categoryId: string) {
    const products = await this.prisma.product.findMany({
      where: { categoryId },
      include: {
        orderItems: true,
      },
    });

    const sizeGuides = await this.prisma.sizeGuide.count({
      where: { categoryId },
    });

    const orderItemCount = products.reduce((acc, p) => acc + p.orderItems.length, 0);

    return {
      productCount: products.length,
      sizeGuideCount: sizeGuides,
      orderItemCount,
      hasOrders: orderItemCount > 0,
      requiresConfirmation: products.length > 0 || sizeGuides > 0,
    };
  }

  async checkProductDependencies(productId: string) {
    const [reviews, orderItems] = await Promise.all([
      this.prisma.productReview.count({ where: { productId } }),
      this.prisma.orderItem.count({ where: { productId } }),
    ]);

    return {
      reviewCount: reviews,
      orderItemCount: orderItems,
      hasOrders: orderItems > 0,
      requiresConfirmation: reviews > 0 || orderItems > 0,
    };
  }

  async checkUserDependencies(userId: string) {
    const [orders, reviews] = await Promise.all([
      this.prisma.order.count({ where: { userId } }),
      this.prisma.productReview.count({ where: { userId } }),
    ]);

    return {
      orderCount: orders,
      reviewCount: reviews,
      hasOrders: orders > 0,
      requiresConfirmation: orders > 0 || reviews > 0,
    };
  }

  async validateDelete(entityType: string, entityId: string) {
    const checks: Record<string, () => Promise<any>> = {
      brand: () => this.checkBrandDependencies(entityId),
      category: () => this.checkCategoryDependencies(entityId),
      product: () => this.checkProductDependencies(entityId),
      user: () => this.checkUserDependencies(entityId),
    };

    const check = checks[entityType];
    if (!check) {
      throw new NotFoundException(`Tipo de entidad ${entityType} no soportado`);
    }

    return check();
  }
}
