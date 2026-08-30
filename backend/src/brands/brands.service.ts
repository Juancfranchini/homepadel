import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(createBrandDto: CreateBrandDto) {
    const baseSlug = this.generateSlug(createBrandDto.name);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.brand.findUnique({ where: { slug } });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return this.prisma.brand.create({
      data: {
        ...createBrandDto,
        slug,
      },
    });
  }

  async findAll() {
    return this.prisma.brand.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.brand.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) {
      throw new NotFoundException('Marca no encontrada');
    }
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) {
      throw new NotFoundException('Marca no encontrada');
    }
    return this.prisma.brand.update({
      where: { id },
      data: updateBrandDto,
    });
  }

  async remove(id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) {
      throw new NotFoundException('Marca no encontrada');
    }

    const productCount = await this.prisma.product.count({
      where: { brandId: id },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar la marca porque tiene ' + productCount + ' productos asociados. Utilice la opcion de desactivar.'
      );
    }

    return this.prisma.brand.delete({ where: { id } });
  }

  async deactivate(id: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) {
      throw new NotFoundException('Marca no encontrada');
    }
    return this.prisma.brand.update({
      where: { id },
      data: { active: false },
    });
  }
}
