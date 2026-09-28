import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DireccionesService } from './direcciones.service';
import { FavoritosService } from './favoritos.service';
import { DireccionDto } from './dto/direccion.dto';
import { SincronizarFavoritosDto } from './dto/sincronizar-favoritos.dto';

interface UsuarioAutenticado {
  id: string;
}

/** Lo que el cliente administra de su propia cuenta. Siempre sobre el usuario del token. */
@ApiTags('Mi cuenta')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mi-cuenta')
export class CuentaController {
  constructor(
    private readonly direcciones: DireccionesService,
    private readonly favoritos: FavoritosService,
  ) {}

  @Get('direcciones')
  listarDirecciones(@CurrentUser() user: UsuarioAutenticado) {
    return this.direcciones.listar(user.id);
  }

  @Post('direcciones')
  crearDireccion(@CurrentUser() user: UsuarioAutenticado, @Body() dto: DireccionDto) {
    return this.direcciones.crear(user.id, dto);
  }

  @Patch('direcciones/:id')
  actualizarDireccion(@CurrentUser() user: UsuarioAutenticado, @Param('id') id: string, @Body() dto: DireccionDto) {
    return this.direcciones.actualizar(user.id, id, dto);
  }

  @Delete('direcciones/:id')
  borrarDireccion(@CurrentUser() user: UsuarioAutenticado, @Param('id') id: string) {
    return this.direcciones.borrar(user.id, id);
  }

  @Get('favoritos')
  listarFavoritos(@CurrentUser() user: UsuarioAutenticado) {
    return this.favoritos.listar(user.id);
  }

  @Get('favoritos/ids')
  idsFavoritos(@CurrentUser() user: UsuarioAutenticado) {
    return this.favoritos.ids(user.id);
  }

  @Post('favoritos/sincronizar')
  sincronizarFavoritos(@CurrentUser() user: UsuarioAutenticado, @Body() dto: SincronizarFavoritosDto) {
    return this.favoritos.sincronizar(user.id, dto.productIds);
  }

  @Put('favoritos/:productId')
  agregarFavorito(@CurrentUser() user: UsuarioAutenticado, @Param('productId') productId: string) {
    return this.favoritos.agregar(user.id, productId);
  }

  @Delete('favoritos/:productId')
  quitarFavorito(@CurrentUser() user: UsuarioAutenticado, @Param('productId') productId: string) {
    return this.favoritos.quitar(user.id, productId);
  }
}
