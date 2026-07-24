import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsletterService {
  constructor(private prisma: PrismaService) {}

  async subscribe(email: string) {
    const existing = await this.prisma.newsletter.findUnique({ where: { email } });
    if (existing) {
      if (!existing.active) {
        return this.prisma.newsletter.update({ where: { email }, data: { active: true } });
      }
      throw new BadRequestException('Este email ya esta suscripto');
    }
    return this.prisma.newsletter.create({ data: { email } });
  }

  async unsubscribe(email: string) {
    const existing = await this.prisma.newsletter.findUnique({ where: { email } });
    if (!existing) throw new BadRequestException('Email no encontrado');
    return this.prisma.newsletter.update({ where: { email }, data: { active: false } });
  }

  async findAll() {
    return this.prisma.newsletter.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
