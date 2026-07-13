import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN)
  findAll() { return this.ordersService.findAll(); }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: any) { return this.ordersService.findByUser(user.id); }

  @Get('track/:number')
  trackByNumber(@Param('number') number: string, @Query('email') email?: string, @Query('phone') phone?: string) {
    return this.ordersService.trackByNumber(number, email, phone);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) { return this.ordersService.findOne(id); }

  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser() user?: any) {
    return this.ordersService.create(dto, user?.id);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status as any);
  }
}
