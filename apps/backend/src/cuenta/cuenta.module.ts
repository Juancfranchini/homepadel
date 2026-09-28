import { Module } from '@nestjs/common';
import { CuentaController } from './cuenta.controller';
import { DireccionesService } from './direcciones.service';
import { FavoritosService } from './favoritos.service';

@Module({
  controllers: [CuentaController],
  providers: [DireccionesService, FavoritosService],
})
export class CuentaModule {}
