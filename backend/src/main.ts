// Punto de entrada de la app NestJS
// Configura Swagger, CORS, validación global, Helmet
// Para correr en dev: npm run start:dev
// Docs disponibles en: http://localhost:4000/api/docs

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global de rutas → /api/...
  app.setGlobalPrefix('api');

  // Seguridad HTTP headers
  app.use(helmet());

  // CORS — acepta localhost en dev y dominios de Vercel + URLs configuradas en producción
  const isDev = process.env.NODE_ENV !== 'production';
  app.enableCors({
    origin: isDev
      ? true
      : (origin, callback) => {
          // Sin origen (curl, Postman, server-side) → permitir
          if (!origin) return callback(null, true);

          const allowed = [
            process.env.FRONTEND_URL,
            process.env.BACKOFFICE_URL,
            'http://localhost:3000',
            'http://localhost:3001',
          ].filter(Boolean) as string[];

          // Acepta cualquier subdominio de vercel.app (previews incluidas)
          if (allowed.includes(origin) || origin.endsWith('.vercel.app')) {
            return callback(null, true);
          }

          callback(new Error(`CORS: origen no permitido → ${origin}`));
        },
    credentials: true,
  });

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger docs → /api/docs
  const config = new DocumentBuilder()
    .setTitle('HomePadel API')
    .setDescription('API REST para la plataforma ecommerce de pádel')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Backend corriendo en http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
