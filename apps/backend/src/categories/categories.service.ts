import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const baseSlug = this.generateSlug(createCategoryDto.name);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.category.findUnique({ where: { slug } });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        slug,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Categoria no encontrada');
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Categoria no encontrada');
    }
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Categoria no encontrada');
    }

    const productCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      throw new BadRequestException(
        'No puedes eliminar la categoria "' + category.name + '" porque tiene ' + productCount + ' productos asociados. Te recomendamos desactivarla.'
      );
    }

    const sizeGuideCount = await this.prisma.sizeGuide.count({
      where: { categoryId: id },
    });

    if (sizeGuideCount > 0) {
      throw new BadRequestException(
        'No puedes eliminar la categoria "' + category.name + '" porque tiene ' + sizeGuideCount + ' guias de talles asociadas. Te recomendamos desactivarla.'
      );
    }

    return this.prisma.category.delete({ where: { id } });
  }

  async deactivate(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Categoria no encontrada');
    }
    return this.prisma.category.update({
      where: { id },
      data: { active: false },
    });
  }
}
