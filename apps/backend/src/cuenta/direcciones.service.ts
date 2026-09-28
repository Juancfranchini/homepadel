import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DireccionDto } from './dto/direccion.dto';

export const MAX_DIRECCIONES = 3;

/** Direcciones de entrega del cliente. Cada uno ve y toca solo las suyas. */
@Injectable()
export class DireccionesService {
  constructor(private prisma: PrismaService) {}

  listar(userId: string) {
    return this.prisma.userAddress.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
  }

  async crear(userId: string, dto: DireccionDto) {
    const cantidad = await this.prisma.userAddress.count({ where: { userId } });
    if (cantidad >= MAX_DIRECCIONES) {
      throw new BadRequestException(`Podés guardar hasta ${MAX_DIRECCIONES} direcciones. Editá o borrá una para sumar otra.`);
    }
    return this.prisma.userAddress.create({ data: { ...this.limpiar(dto), userId } });
  }

  async actualizar(userId: string, id: string, dto: DireccionDto) {
    await this.propia(userId, id);
    return this.prisma.userAddress.update({ where: { id }, data: this.limpiar(dto) });
  }

  async borrar(userId: string, id: string) {
    const { count } = await this.prisma.userAddress.deleteMany({ where: { id, userId } });
    if (count === 0) throw new NotFoundException('Dirección no encontrada');
    return { ok: true };
  }

  private async propia(userId: string, id: string) {
    const direccion = await this.prisma.userAddress.findFirst({ where: { id, userId } });
    if (!direccion) throw new NotFoundException('Dirección no encontrada');
    return direccion;
  }

  private limpiar(dto: DireccionDto) {
    return {
      label: dto.label?.trim() || null,
      street: dto.street.trim(),
      city: dto.city.trim(),
      province: dto.province.trim(),
      postalCode: dto.postalCode.trim(),
      phone: dto.phone?.trim() || null,
    };
  }
}
