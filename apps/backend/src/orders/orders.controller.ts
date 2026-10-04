import { Controller, Get, Post, Patch, Param, Body, Query, Req, UseGuards, ParseEnumPipe } from '@nestjs/common';
import type { Request } from 'express';
import { clienteDesdeRequest } from '../common/meta/meta-cliente';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { POS_PERMISSIONS } from '../common/permissions';
import { OrderStatus } from '@prisma/client';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard) @Permissions(POS_PERMISSIONS.SELL)
  findAll() { return this.ordersService.findAll(); }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: any) { return this.ordersService.findByUser(user.id); }

  @Get('track/:number')
  trackByNumber(@Param('number') number: string, @Query('email') email?: string, @Query('phone') phone?: string) {
    return this.ordersService.trackByNumber(number, email, phone);
  }

  // Datos del comprador (nombre, email, teléfono, domicilio): solo para quien
  // vende. Antes alcanzaba con cualquier sesión de cliente.
  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard) @Permissions(POS_PERMISSIONS.SELL)
  findOne(@Param('id') id: string) { return this.ordersService.findOne(id); }

  // Se puede comprar como invitado (la sesión es opcional). Cada pedido por
  // transferencia descuenta stock: por eso el límite por IP y el tope de
  // pedidos sin pagar por cuenta o mail (exigirTransferencia).
  @Post()
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  create(@Body() dto: CreateOrderDto, @Req() req: Request, @CurrentUser() user?: any) {
    return this.ordersService.create(dto, user?.id, clienteDesdeRequest(req, dto.meta));
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard) @Permissions(POS_PERMISSIONS.SELL)
  updateStatus(
    @Param('id') id: string,
    // Solo los estados que existen: antes llegaba cualquier texto y se guardaba tal cual.
    @Body('status', new ParseEnumPipe(OrderStatus)) status: OrderStatus,
    @Body('trackingNumber') trackingNumber?: string,
    @Body('trackingUrl') trackingUrl?: string,
  ) {
    return this.ordersService.updateStatus(id, status, trackingNumber, trackingUrl);
  }
}
