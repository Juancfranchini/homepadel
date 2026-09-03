import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const { page = 1, limit = 20, category, brand, search, minPrice, maxPrice, showAll, isOffer } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = showAll === '1' ? {} : { active: true };
    if (category) where.category = { slug: category };
    if (brand) where.brand = { slug: brand };
    if (isOffer === 'true') where.isOffer = true;
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        include: { category: true, brand: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) };
  }

  findFeatured() {
    return this.prisma.product.findMany({
      where: { featured: true, active: true },
      include: { category: true, brand: true },
      take: 8,
    });
  }

  async findBestSellers() {
    const grouped = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: {
        order: {
          status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
        },
      },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 8,
    });

    if (grouped.length === 0) return [];

    const productIds = grouped.map((g) => g.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
      include: { category: true, brand: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    return grouped
      .map((g) => productMap.get(g.productId))
      .filter((p) => p !== undefined);
  }

  async findBySlug(slugOrId: string) {
    const product = await this.prisma.product.findFirst({
      where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
      include: {
        category: true,
        brand: true,
        reviews: { where: { active: true } },
      },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const reviews = (product as any).reviews || [];
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / totalReviews
      : 0;

    const { reviews: _, ...rest } = product as any;
    return {
      ...rest,
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: totalReviews,
    };
  }

  async create(dto: CreateProductDto) {
    const { categoryId, brandId, ...rest } = dto as any;
    if (!categoryId) throw new NotFoundException('categoryId es requerido');
    if (!brandId) throw new NotFoundException('brandId es requerido');

    // F4 - Verificar si el slug ya existe y agregar sufijo
    let slug = slugify(rest.name, { lower: true, strict: true });
    let slugExists = await this.prisma.product.findUnique({ where: { slug } });
    let counter = 1;

    while (slugExists) {
      slug = slugify(rest.name, { lower: true, strict: true }) + '-' + counter;
      slugExists = await this.prisma.product.findUnique({ where: { slug } });
      counter++;
    }

    try {
      return await this.prisma.product.create({
        data: { ...rest, slug, categoryId, brandId },
        include: { category: true, brand: true },
      });
    } catch (err: any) {
      // Traducir error de Prisma
      if (err?.code === 'P2002') {
        throw new NotFoundException('Ya existe un producto con ese nombre o SKU.');
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findById(id);
    const data: any = { ...dto };
    if (dto.name) data.slug = slugify(dto.name, { lower: true, strict: true });
    return this.prisma.product.update({ where: { id }, data, include: { category: true, brand: true } });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.product.delete({ where: { id } });
  }

  private async findById(id: string) {
    const p = await this.prisma.product.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Producto no encontrado');
    return p;
  }
}
