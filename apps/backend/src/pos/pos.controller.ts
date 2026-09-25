import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { POS_PERMISSIONS } from '../common/permissions';
import { CreatePosSaleDto, RegisterPosPaymentDto } from './dto/pos-sale.dto';
import { CancelSaleDto, CreateReturnDto } from './dto/returns.dto';
import { CreateSalesLinkDto, SaveCartDto } from './dto/saved-cart.dto';
import { CreateBranchDto, CreateCashRegisterDto } from './dto/pos-settings.dto';
import { PosSearchQueryDto, PosStatsQueryDto } from './dto/stats-query.dto';
import { PosCartsService } from './pos-carts.service';
import { PosReturnsService } from './pos-returns.service';
import { PosActor, PosSalesService } from './pos-sales.service';
import { PosStatsService } from './pos-stats.service';
import { SalesLinksService } from './sales-links.service';

@ApiTags('Point of sale')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('pos')
export class PosController {
  constructor(
    private readonly sales: PosSalesService,
    private readonly carts: PosCartsService,
    private readonly links: SalesLinksService,
    private readonly returns: PosReturnsService,
    private readonly stats: PosStatsService,
  ) {}

  @Get('catalog')
  @Permissions(POS_PERMISSIONS.SELL)
  catalog(@Query() query: PosSearchQueryDto) {
    return this.sales.catalog(query.search);
  }

  @Get('customers')
  @Permissions(POS_PERMISSIONS.SELL)
  customers(@Query() query: PosSearchQueryDto) {
    return this.sales.customers(query.search);
  }

  @Get('config')
  @Permissions(POS_PERMISSIONS.SELL)
  config() {
    return this.sales.config();
  }

  @Get('sellers')
  @Permissions(POS_PERMISSIONS.STATS)
  sellers() {
    return this.sales.sellers();
  }

  @Get('settings/config')
  @Permissions(POS_PERMISSIONS.SETTINGS)
  settingsConfig() {
    return this.sales.config();
  }

  @Post('config/branches')
  @Permissions(POS_PERMISSIONS.SETTINGS)
  createBranch(@Body() dto: CreateBranchDto, @CurrentUser() actor: PosActor) {
    return this.sales.createBranch(dto, actor.id);
  }

  @Post('config/registers')
  @Permissions(POS_PERMISSIONS.SETTINGS)
  createRegister(@Body() dto: CreateCashRegisterDto, @CurrentUser() actor: PosActor) {
    return this.sales.createRegister(dto, actor.id);
  }

  @Post('sales')
  @Permissions(POS_PERMISSIONS.SELL)
  createSale(@Body() dto: CreatePosSaleDto, @CurrentUser() actor: PosActor) {
    return this.sales.createSale(dto, actor);
  }

  @Post('orders/:id/payments')
  @Permissions(POS_PERMISSIONS.SELL)
  addPayment(
    @Param('id') id: string,
    @Body() dto: RegisterPosPaymentDto,
    @CurrentUser() actor: PosActor,
  ) {
    return this.sales.addPayment(id, dto, actor);
  }

  @Post('orders/:id/returns')
  @Permissions(POS_PERMISSIONS.RETURNS)
  createReturn(
    @Param('id') id: string,
    @Body() dto: CreateReturnDto,
    @CurrentUser() actor: PosActor,
  ) {
    return this.returns.createReturn(id, dto, actor.id);
  }

  @Post('orders/:id/cancel')
  @Permissions(POS_PERMISSIONS.RETURNS)
  cancel(@Param('id') id: string, @Body() dto: CancelSaleDto, @CurrentUser() actor: PosActor) {
    return this.returns.cancel(id, dto, actor.id);
  }

  @Get('carts')
  @Permissions(POS_PERMISSIONS.SELL)
  cartsList(@CurrentUser() actor: PosActor) {
    return this.carts.list(actor.id);
  }

  @Post('carts')
  @Permissions(POS_PERMISSIONS.SELL)
  saveCart(@Body() dto: SaveCartDto, @CurrentUser() actor: PosActor) {
    return this.carts.create(dto, actor.id);
  }

  @Delete('carts/:id')
  @Permissions(POS_PERMISSIONS.SELL)
  deleteCart(@Param('id') id: string, @CurrentUser() actor: PosActor) {
    return this.carts.remove(id, actor.id);
  }

  @Get('links')
  @Permissions(POS_PERMISSIONS.SELL)
  linksList(@CurrentUser() actor: PosActor) {
    return this.links.list(actor.id);
  }

  @Post('links')
  @Permissions(POS_PERMISSIONS.SELL)
  createLink(@Body() dto: CreateSalesLinkDto, @CurrentUser() actor: PosActor) {
    return this.links.create(dto, actor.id);
  }

  @Get('stats')
  @Permissions(POS_PERMISSIONS.STATS)
  getStats(@Query() query: PosStatsQueryDto) {
    return this.stats.get(query);
  }
}

@ApiTags('Sales checkout links')
@Controller('sales-links')
export class PublicSalesLinksController {
  constructor(private readonly links: SalesLinksService) {}

  @Get(':token')
  detail(@Param('token') token: string) {
    return this.links.publicDetail(token);
  }
}
