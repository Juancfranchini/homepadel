// CRUD de gastos operativos — solo ADMIN
// GET    /api/expenses        — listar gastos ordenados por fecha
// POST   /api/expenses        — registrar nuevo gasto
// PATCH  /api/expenses/:id    — actualizar gasto
// DELETE /api/expenses/:id    — eliminar gasto
//
// Campos: description, amount, category (ej: "Envíos", "Marketing"), date

import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get() findAll() { return this.expensesService.findAll(); }
  @Post() create(@Body() dto: any) { return this.expensesService.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: any) { return this.expensesService.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.expensesService.remove(id); }
}
