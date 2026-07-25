import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactChannelsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.contactChannel.findMany({ where: { active: true }, orderBy: { order: 'asc' } });
  }

  findAllAdmin() {
    return this.prisma.contactChannel.findMany({ orderBy: { order: 'asc' } });
  }

  create(dto: any) {
    return this.prisma.contactChannel.create({ data: dto });
  }

  async update(id: string, dto: any) {
    const item = await this.prisma.contactChannel.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Canal no encontrado');
    return this.prisma.contactChannel.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const item = await this.prisma.contactChannel.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Canal no encontrado');
    return this.prisma.contactChannel.delete({ where: { id } });
  }
}
