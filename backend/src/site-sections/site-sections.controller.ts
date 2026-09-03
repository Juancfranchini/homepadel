import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SiteSectionsService, SectionKey } from './site-sections.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Site Sections')
@Controller('site-sections')
export class SiteSectionsController {
  constructor(private readonly siteSectionsService: SiteSectionsService) {}

  // Público  cualquiera puede leer una sección por clave
  @Get(':key')
  async findOne(@Param('key') key: SectionKey) {
    const section = await this.siteSectionsService.findOne(key);

    // S1 - Filtrar credenciales sensibles de payment_methods
    if (key === 'payment_methods' && section?.data) {
      const data = section.data as any;
      const { mercadopago, ...safeData } = data;
      if (mercadopago?.accessToken) {
        const { accessToken, ...safeMercadopago } = mercadopago;
        return {
          ...section,
          data: {
            ...safeData,
            mercadopago: safeMercadopago,
          },
        };
      }
    }

    return section;
  }

  // Admin  upsert de una sección
  @Put(':key')
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN)
  upsert(
    @Param('key') key: SectionKey,
    @Body() dto: { data: Record<string, unknown>; active?: boolean },
  ) {
    return this.siteSectionsService.upsert(key, dto);
  }
}