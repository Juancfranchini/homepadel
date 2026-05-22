// Servicio global de Prisma — se inyecta en cualquier módulo
// Extiende PrismaClient para exponer todos los métodos de acceso a la BD
// Se conecta automáticamente al iniciar el módulo

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
