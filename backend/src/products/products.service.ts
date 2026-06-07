// Servicio de productos
// findAll: paginación + filtros por categoría, marca, búsqueda de texto y rango de precio
// El slug se genera automáticamente a partir del nombre con slugify
// findFeatured: retorna hasta 8 productos destacados para el home

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const { page = 1, limit = 20, category, brand, search, minPrice, maxPrice, showAll } = query;
    const skip = (Number(page) - 1) * Number(limit);

    // showAll=1 omite el filtro active:true — usado por el backoffice admin
    const where: any = showAll === '1' ? {} : { active: true };
    if (category) where.category = { slug: category };
    if (brand) where.brand = { slug: brand };
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

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { category: true, brand: true },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  create(dto: CreateProductDto) {
    const slug = slugify(dto.name, { lower: true, strict: true });
    return this.prisma.product.create({ data: { ...dto, slug }, include: { category: true, brand: true } });
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
