// CRUD de cupones de descuento
// GET    /api/coupons           — listar todos (ADMIN)
// POST   /api/coupons/validate  — validar cupón por código (público, para el checkout)
// POST   /api/coupons           — crear cupón (ADMIN)
// PATCH  /api/coupons/:id       — actualizar cupón (ADMIN)
// DELETE /api/coupons/:id       — eliminar cupón (ADMIN)

import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get() @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN)
  findAll() { return this.couponsService.findAll(); }

  @Post('validate')
  validate(@Body('code') code: string) { return this.couponsService.validate(code); }

  @Post()
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN)
  create(@Body() dto: any) { return this.couponsService.create(dto); }

  @Patch(':id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: any) { return this.couponsService.update(id, dto); }

  @Delete(':id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN)
  remove(@Param('id') id: string) { return this.couponsService.remove(id); }
}
