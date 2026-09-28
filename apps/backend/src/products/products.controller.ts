// CRUD completo de productos
// GET    /api/products               lista páginada con filtros (público)
// GET    /api/products/best-sellers  productos mas vendidos para el home (público)
// GET    /api/products/featured      productos destacados para el home (público)
// GET    /api/products/:slug         detalle por slug (público)
// POST   /api/products               crear producto (ADMIN)
// PATCH  /api/products/:id           actualizar producto (ADMIN)
// DELETE /api/products/:id           eliminar producto (ADMIN)
//
// Filtros disponibles: page, limit, category (slug), brand (slug), search, minPrice, maxPrice

import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { POS_PERMISSIONS } from '../common/permissions';

/** Quien trabaja en la tienda (backoffice, punto de venta): ve también los productos dados de baja. */
const esPersonal = (user?: { role?: Role }) => user?.role === Role.ADMIN || user?.role === Role.STAFF;

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'brand', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'size', required: false })
  @ApiQuery({ name: 'color', required: false })
  @ApiQuery({ name: 'weight', required: false })
  @ApiQuery({ name: 'weightUnit', required: false })
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Query() query: any, @Req() req: { user?: { role?: Role } }) {
    // `showAll=1` (incluir los dados de baja) es solo para el personal: antes
    // cualquiera podía listar productos inactivos, y la tienda lo usaba para
    // los relacionados, así que uno dado de baja podía aparecer ahí.
    const showAll = esPersonal(req.user) ? query.showAll : undefined;
    return this.productsService.findAll({ ...query, showAll });
  }

  @Get('best-sellers')
  findBestSellers() {
    return this.productsService.findBestSellers();
  }

  @Get('featured')
  findFeatured() {
    return this.productsService.findFeatured();
  }

  // Un producto dado de baja no se muestra en la tienda, ni siquiera entrando
  // por su dirección: antes la ficha abría igual. El personal (backoffice,
  // punto de venta) sí lo ve, para poder editarlo y reactivarlo.
  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('slug') slug: string, @Req() req: { user?: { role?: Role } }) {
    return this.productsService.findBySlug(slug, { incluirInactivos: esPersonal(req.user) });
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(POS_PERMISSIONS.CREATE_PRODUCT)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Delete(':productId/variants/:variantId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  removeVariant(@Param('productId') productId: string, @Param('variantId') variantId: string) {
    return this.productsService.removeVariant(productId, variantId);
  }
}
