// CRUD de promociones
// GET    /api/promotions        — listar todas (público)
// POST   /api/promotions        — crear (ADMIN)
// PATCH  /api/promotions/:id    — actualizar (ADMIN)
// DELETE /api/promotions/:id    — eliminar (ADMIN)

import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get() findAll() { return this.promotionsService.findAll(); }

  @Post()
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN)
  create(@Body() dto: any) { return this.promotionsService.create(dto); }

  @Patch(':id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: any) { return this.promotionsService.update(id, dto); }

  @Delete(':id')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN)
  remove(@Param('id') id: string) { return this.promotionsService.remove(id); }
}
