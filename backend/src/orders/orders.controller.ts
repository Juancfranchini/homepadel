// Gestión de pedidos — todas las rutas requieren autenticación
// GET   /api/orders              — todos los pedidos (ADMIN)
// GET   /api/orders/my           — pedidos del usuario autenticado
// GET   /api/orders/:id          — detalle de pedido
// POST  /api/orders              — crear pedido (usuario autenticado)
// PATCH /api/orders/:id/status   — cambiar estado del pedido (ADMIN)

import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(RolesGuard) @Roles(Role.ADMIN)
  findAll() { return this.ordersService.findAll(); }

  @Get('my')
  findMine(@CurrentUser() user: any) { return this.ordersService.findByUser(user.id); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.ordersService.findOne(id); }

  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: any) {
    return this.ordersService.create(dto, user.id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard) @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status as any);
  }
}
