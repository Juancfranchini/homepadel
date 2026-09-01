// Módulo de uploads de imágenes con Multer
// Configuración: almacenamiento en memoria (base64)
// Límite de tamaño: 5MB por defecto (configurable con MAX_FILE_SIZE en .env)
// Solo acepta imágenes: jpg, jpeg, png, gif, webp

import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsController } from './uploads.controller';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 5242880 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(new Error('Solo se permiten imágenes'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  ],
  controllers: [UploadsController],
})
export class UploadsModule {}
