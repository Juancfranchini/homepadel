// Módulo global de Prisma — disponible en toda la app sin necesidad de importarlo
// Se marca como @Global() para que PrismaService sea inyectable en cualquier módulo

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
