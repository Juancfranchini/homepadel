import { Controller, Get, Put, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SiteSectionsService, SectionKey } from './site-sections.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { sanitizeSection } from './site-sections.sanitize';
import { Role } from '@prisma/client';

@ApiTags('Site Sections')
@Controller('site-sections')
export class SiteSectionsController {
  constructor(private readonly siteSectionsService: SiteSectionsService) {}

  // Público  cualquiera puede leer una sección por clave
  // N1 - La sección se devuelve completa solo a un administrador autenticado.
  // Para cualquier otra consulta se eliminan las credenciales, sin importar de
  // qué clave se trate: así una integración nueva no vuelve a filtrar sus
  // claves por el solo hecho de guardarlas acá.
  @Get(':key')
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(@Param('key') key: SectionKey, @Req() req: any) {
    const section = await this.siteSectionsService.findOne(key);
    const isAdmin = req?.user?.role === Role.ADMIN;
    return sanitizeSection(section as any, isAdmin);
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