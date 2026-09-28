import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AbandonedCartsService } from './abandoned-carts.service';
import { SaveAbandonedCartDto } from './dto/save-abandoned-cart.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Carritos abandonados')
@Controller('abandoned-carts')
export class AbandonedCartsController {
  constructor(private readonly service: AbandonedCartsService) {}

  /** Lo llama la tienda mientras alguien completa el checkout. Con sesión, el mail de la cuenta también cuenta para reconocer una prueba. */
  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  save(@Body() dto: SaveAbandonedCartDto, @CurrentUser() usuario?: { email?: string }) {
    return this.service.save(dto, usuario?.email);
  }

  // Lo de acá abajo es solo para la tienda: son datos personales de gente que
  // no compró, así que no se exponen sin sesión de administrador.

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findPending() {
    return this.service.findPending();
  }

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  stats() {
    return this.service.stats();
  }

  @Patch(':id/contacted')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  markContacted(@Param('id') id: string) {
    return this.service.markContacted(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
