import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const pageNumber = Math.max(1, Number.parseInt(String(query.page ?? 1), 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(String(query.limit ?? 20), 10) || 20));
    const { category, brand, search, minPrice, maxPrice, showAll, isOffer, size, color, weight, weightUnit } = query;
    const skip = (pageNumber - 1) * pageSize;

    const where: any = showAll === '1' ? {} : { active: true };
    const propertyFilters: any[] = [];
    if (category) where.category = { slug: category };
    if (brand) where.brand = { slug: brand };
    if (isOffer === 'true') where.isOffer = true;
    if (size) propertyFilters.push({ OR: [{ size }, { variants: { some: { size, active: true } } }] });
    if (color) propertyFilters.push({ OR: [{ color }, { variants: { some: { color, active: true } } }] });
    if (weight && Number.isFinite(Number(weight))) {
      const numericWeight = Number(weight);
      const unit = String(weightUnit || '').toLowerCase();
      const factors: Record<string, number> = { mg: 0.001, g: 1, kg: 1000, lb: 453.59237 };
      const baseWeight = factors[unit] ? numericWeight * factors[unit] : numericWeight;
      const weightMatches = Object.entries(factors).map(([candidateUnit, factor]) => ({
        weight: baseWeight / factor,
        weightUnit: candidateUnit,
      }));
      propertyFilters.push({
        OR: [
          { AND: weightMatches.map((match) => ({ weight: match.weight, weightUnit: match.weightUnit })) },
          { variants: { some: { active: true, OR: weightMatches } } },
        ],
      });
    }
    if (propertyFilters.length > 0) where.AND = propertyFilters;
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
        take: pageSize,
        include: { category: true, brand: true, variants: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page: pageNumber, limit: pageSize, pages: Math.ceil(total / pageSize) };
  }

  async findFeatured() {
    const products = await this.prisma.product.findMany({
      where: { featured: true, active: true },
      include: { category: true, brand: true, variants: true },
      take: 8,
    });
    return products;
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
      include: { category: true, brand: true, variants: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    return grouped
      .map((g) => productMap.get(g.productId))
      .filter((p) => p !== undefined)
      .map((product) => product);
  }

  async findBySlug(slugOrId: string) {
    const product = await this.prisma.product.findFirst({
      where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
      include: {
        category: true,
        brand: true,
        variants: true,
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
    const { categoryId, brandId, variants, ...rest } = dto as any;
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
      const product = await this.prisma.product.create({
        data: {
          ...rest, slug, categoryId, brandId,
        },
      });
      await this.prisma.productVariant.createMany({
        data: [
          this.defaultVariantData(product),
          ...(variants ?? []).map((variant: any) => ({ ...variant, productId: product.id })),
        ],
      });
      return this.prisma.product.findUniqueOrThrow({ where: { id: product.id }, include: { category: true, brand: true, variants: true } });
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
    const { variants, ...rest } = dto as any;
    const data: any = { ...rest };
    if (dto.name) data.slug = slugify(dto.name, { lower: true, strict: true });

    if (variants !== undefined) {
      const existing = await this.prisma.productVariant.findMany({ where: { productId: id, isDefault: false }, select: { id: true } });
      const incomingIds = new Set(variants.map((variant: any) => variant.id).filter(Boolean));
      const existingIds = new Set(existing.map((variant) => variant.id));
      if ([...incomingIds].some((variantId: string) => !existingIds.has(variantId))) {
        throw new ConflictException('Una variante no pertenece a este producto.');
      }
      const removedIds = existing.map((variant) => variant.id).filter((variantId) => !incomingIds.has(variantId));
      if (removedIds.length > 0) {
        const linkedOrders = await this.prisma.orderItem.count({ where: { variantId: { in: removedIds } } });
        if (linkedOrders > 0) {
          throw new ConflictException('No se puede eliminar una variante que ya pertenece a un pedido.');
        }
      }
      data.variants = {
        deleteMany: removedIds.length > 0 ? { id: { in: removedIds } } : undefined,
        update: variants.filter((variant: any) => variant.id).map((variant: any) => ({
          where: { id: variant.id },
          data: Object.fromEntries(Object.entries(variant).filter(([key]) => key !== 'id' && key !== 'productId')),
        })),
        create: variants.filter((variant: any) => !variant.id).map((variant: any) => {
          const { id: _id, productId: _productId, ...newVariant } = variant;
          return newVariant;
        }),
      };
    }

    const product = await this.prisma.product.update({ where: { id }, data });
    await this.prisma.productVariant.upsert({
      where: { id: `${id}-base` },
      update: this.defaultVariantData(product),
      create: this.defaultVariantData(product),
    });
    return this.prisma.product.findUniqueOrThrow({ where: { id }, include: { category: true, brand: true, variants: true } });
  }

  private defaultVariantData(product: any) {
    return {
      id: `${product.id}-base`,
      productId: product.id,
      sku: product.sku,
      size: product.size ?? '',
      color: product.color ?? null,
      dimensionLength: product.dimensionLength ?? null,
      dimensionWidth: product.dimensionWidth ?? null,
      dimensionHeight: product.dimensionHeight ?? null,
      dimensionUnit: product.dimensionUnit ?? null,
      weight: product.weight ?? null,
      weightUnit: product.weightUnit ?? null,
      imageUrl: product.images?.[0] ?? null,
      images: product.images?.slice(1) ?? [],
      stock: product.stock,
      active: product.active,
      isDefault: true,
    };
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.product.delete({ where: { id } });
  }

  async removeVariant(productId: string, variantId: string) {
    await this.findById(productId);
    const variant = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
      select: { id: true },
    });
    if (!variant) throw new NotFoundException('Variante no encontrada');
    const linkedOrders = await this.prisma.orderItem.count({ where: { variantId } });
    if (linkedOrders > 0) {
      throw new ConflictException('No se puede eliminar una variante que ya pertenece a un pedido.');
    }
    return this.prisma.productVariant.delete({ where: { id: variantId } });
  }

  private async findById(id: string) {
    const p = await this.prisma.product.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Producto no encontrado');
    return p;
  }
}
