import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function normalizeDto(dto: any): any {
  const { isActive, imageUrl, imageMobile, ...rest } = dto;
  if (isActive !== undefined) rest.active = isActive;
  if (imageUrl !== undefined) rest.image = imageUrl;
  if (imageMobile !== undefined) rest.imageMobile = imageMobile || null;
  // Si no hay imagen y es creacion, dejamos un placeholder
  return rest;
}

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.banner.findMany({ where: { active: true }, orderBy: { order: 'asc' } }); }
  findAllAdmin() { return this.prisma.banner.findMany({ orderBy: { order: 'asc' } }); }

  create(dto: any) {
    const data = normalizeDto(dto);
    if (!data.image && !data.imageUrl) data.image = '';
    return this.prisma.banner.create({ data });
  }

  async update(id: string, dto: any) {
    const b = await this.prisma.banner.findUnique({ where: { id } });
    if (!b) throw new NotFoundException('Banner no encontrado');
    return this.prisma.banner.update({ where: { id }, data: normalizeDto(dto) });
  }

  async remove(id: string) {
    const b = await this.prisma.banner.findUnique({ where: { id } });
    if (!b) throw new NotFoundException('Banner no encontrado');
    return this.prisma.banner.delete({ where: { id } });
  }
}
