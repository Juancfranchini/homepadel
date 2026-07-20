import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import slugify from 'slugify';

function normalizeDto(dto: any): any {
  const { isActive, ...rest } = dto;
  if (isActive !== undefined) rest.active = isActive;
  return rest;
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  create(dto: any) {
    const data = normalizeDto(dto);
    const slug = slugify(data.name, { lower: true, strict: true });
    return this.prisma.category.create({ data: { ...data, slug } });
  }

  async update(id: string, dto: any) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Categoria no encontrada');
    const data = normalizeDto(dto);
    if (data.name) data.slug = slugify(data.name, { lower: true, strict: true });
    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: string) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Categoria no encontrada');
    try {
      return await this.prisma.category.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2003' || error.code === 'P2014') {
        throw new BadRequestException('No se puede eliminar esta categoria porque tiene productos asociados.');
      }
      throw error;
    }
  }
}
