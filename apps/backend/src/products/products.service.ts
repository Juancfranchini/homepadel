import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { effectivePrice } from '../pricing/effective-price';
import { buildSearchFilter, idsPorBusquedaSinAcentos } from './products.search';
import { precioEfectivoEnRango } from './products.price-filter';
import slugify from 'slugify';

/**
 * Agrega `effectivePrice` a cada producto antes de devolverlo — mismo cálculo
 * que usa el checkout (PricingService). El frontend nunca vuelve a decidir
 * solo qué precio mostrar.
 */
function withEffectivePrice<T extends { price: number; salePrice: number | null }>(product: T): T & { effectivePrice: number } {
  return { ...product, effectivePrice: effectivePrice(product.price, product.salePrice) };
}

/**
 * Traduce la opción de orden que llega del catálogo a una cláusula de Prisma.
 *
 * El orden tiene que resolverse en la base y no en el navegador: el listado
 * viene paginado, así que ordenar del lado del cliente reacomoda únicamente los
 * doce productos visibles y da un resultado engañoso.
 *
 * Se ordena por `price` y no por el precio efectivo porque este último se
 * calcula después de la consulta; para el orden alcanza, ya que la promoción se
 * carga en `salePrice` y el precio de lista mantiene la misma escala relativa.
 */
export function resolveOrderBy(sort: unknown): Record<string, 'asc' | 'desc'> {
  const opciones: Record<string, Record<string, 'asc' | 'desc'>> = {
    newest: { createdAt: 'desc' },
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
    name_asc: { name: 'asc' },
    featured: { featured: 'desc' },
  };
  return opciones[String(sort ?? '')] ?? opciones.newest;
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const pageNumber = Math.max(1, Number.parseInt(String(query.page ?? 1), 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(String(query.limit ?? 20), 10) || 20));
    const { category, brand, search, minPrice, maxPrice, showAll, isOffer, size, color, weight, weightUnit, shape, gender, level, sort } = query;
    const skip = (pageNumber - 1) * pageSize;

    const where: any = showAll === '1' ? {} : { active: true };
    const propertyFilters: any[] = [];
    if (category) where.category = { slug: category };
    if (brand) where.brand = { slug: brand };
    if (isOffer === 'true') where.isOffer = true;
    if (shape) where.shape = shape;
    // Una paleta unisex le sirve a hombre y a mujer: "Hombre" sin las unisex
    // mostraba 1 sola paleta de 37. Pedir "Unisex" sigue trayendo solo esas.
    if (gender) where.gender = gender === 'Hombre' || gender === 'Mujer' ? { in: [gender, 'Unisex'] } : gender;
    if (level) where.level = level;
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
    if (search) {
      // Primero se intenta ignorando tildes, que es como escribe la mayoría:
      // "royal padel" sin tilde tiene que encontrar "Royal Pádel". Si la base
      // no tiene la extensión `unaccent`, se cae al filtro que sí las respeta:
      // encuentra menos, nunca de más.
      const ids = await idsPorBusquedaSinAcentos(this.prisma, search);
      if (ids) {
        propertyFilters.push({ id: { in: ids } });
      } else {
        const searchFilter = buildSearchFilter(search);
        if (searchFilter) propertyFilters.push(searchFilter);
      }
    }
    const filtroPrecio = precioEfectivoEnRango(
      this.prisma.product.fields.price,
      minPrice ? Number(minPrice) : undefined,
      maxPrice ? Number(maxPrice) : undefined,
    );
    if (filtroPrecio) propertyFilters.push(filtroPrecio);
    if (propertyFilters.length > 0) where.AND = propertyFilters;

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        include: { category: true, brand: true, variants: true },
        orderBy: resolveOrderBy(sort),
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items: items.map(withEffectivePrice), total, page: pageNumber, limit: pageSize, pages: Math.ceil(total / pageSize) };
  }

  async findFeatured() {
    const products = await this.prisma.product.findMany({
      where: { featured: true, active: true },
      include: { category: true, brand: true, variants: true },
      take: 8,
    });
    return products.map(withEffectivePrice);
  }

  async findBestSellers() {
    const grouped = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: {
        order: {
          status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
          isTest: false,
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
      .map((product) => withEffectivePrice(product));
  }

  async findBySlug(slugOrId: string, { incluirInactivos = false } = {}) {
    const product = await this.prisma.product.findFirst({
      where: { OR: [{ slug: slugOrId }, { id: slugOrId }], ...(incluirInactivos ? {} : { active: true }) },
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
      ...withEffectivePrice(rest),
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: totalReviews,
    };
  }

  async create(dto: CreateProductDto) {
    const { categoryId, brandId, variants, ...rest } = dto as any;
    if (!rest.barcode?.trim()) rest.barcode = null;
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
    if (data.barcode !== undefined && !data.barcode?.trim()) data.barcode = null;
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
