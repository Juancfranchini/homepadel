// Servicio de gastos operativos
// Los gastos se ordenan por fecha descendente (más recientes primero)

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  findAll() { return this.prisma.expense.findMany({ orderBy: { date: 'desc' } }); }

  create(dto: any) { return this.prisma.expense.create({ data: dto }); }

  async update(id: string, dto: any) {
    const e = await this.prisma.expense.findUnique({ where: { id } });
    if (!e) throw new NotFoundException('Gasto no encontrado');
    return this.prisma.expense.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const e = await this.prisma.expense.findUnique({ where: { id } });
    if (!e) throw new NotFoundException('Gasto no encontrado');
    return this.prisma.expense.delete({ where: { id } });
  }
}
