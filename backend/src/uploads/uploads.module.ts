// Módulo de uploads de imágenes con Multer
// Configuración: almacenamiento en disco, nombres únicos con timestamp
// Límite de tamaño: 5MB por defecto (configurable con MAX_FILE_SIZE en .env)
// Solo acepta imágenes: jpg, jpeg, png, gif, webp
// Los archivos se guardan en: ./uploads/ (configurable con UPLOADS_DIR en .env)

import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UploadsController } from './uploads.controller';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: process.env.UPLOADS_DIR || './uploads',
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
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
