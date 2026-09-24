import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PublicTestimonialDto } from './dto/public-testimonial.dto';
import { CreateTestimonialDto, UpdateTestimonialDto } from './dto/testimonial.dto';

function normalizeDto<T extends CreateTestimonialDto | UpdateTestimonialDto>(dto: T): Omit<T, 'isActive'> & { active?: boolean } {
  const { isActive, ...rest } = dto;
  return { ...rest, ...(isActive !== undefined ? { active: isActive } : {}) };
}

@Injectable()
export class TestimonialsService {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.testimonial.findMany({ where: { active: true }, orderBy: { order: 'asc' } }); }
  findAllAdmin() { return this.prisma.testimonial.findMany({ orderBy: { order: 'asc' } }); }

  create(dto: CreateTestimonialDto) { return this.prisma.testimonial.create({ data: normalizeDto(dto) }); }

  createPublic(dto: PublicTestimonialDto) {
    return this.prisma.testimonial.create({
      data: {
        name: dto.name,
        comment: dto.comment,
        rating: dto.rating,
        active: false,
      },
    });
  }

  async approve(id: string) {
    const item = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Testimonio no encontrado');
    return this.prisma.testimonial.update({ where: { id }, data: { active: true } });
  }

  async update(id: string, dto: UpdateTestimonialDto) {
    const item = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Testimonio no encontrado');
    return this.prisma.testimonial.update({ where: { id }, data: normalizeDto(dto) });
  }

  async remove(id: string) {
    const item = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Testimonio no encontrado');
    return this.prisma.testimonial.delete({ where: { id } });
  }
}
