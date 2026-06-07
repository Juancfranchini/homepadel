import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

// Claves válidas para secciones singleton del sitio
export type SectionKey = 'about' | 'instagram' | 'final_message';

@Injectable()
export class SiteSectionsService {
  constructor(private prisma: PrismaService) {}

  async findOne(key: SectionKey) {
    const section = await this.prisma.siteSection.findUnique({ where: { key } });
    return section ?? { key, data: this.getDefault(key), active: true };
  }

  async upsert(key: SectionKey, dto: { data: Record<string, unknown>; active?: boolean }) {
    return this.prisma.siteSection.upsert({
      where: { key },
      update: { data: dto.data as Prisma.InputJsonValue, active: dto.active ?? true },
      create: { key, data: dto.data as Prisma.InputJsonValue, active: dto.active ?? true },
    });
  }

  // Valores por defecto para que el frontend nunca reciba null
  private getDefault(key: SectionKey): Record<string, unknown> {
    const defaults: Record<SectionKey, Record<string, unknown>> = {
      about: {
        title: 'Somos Home Pádel',
        description: 'Vivimos el pádel tanto como vos. Seleccionamos los mejores productos para que solo te enfoques en jugar tu mejor partido.',
        image: null,
        benefits: [
          { icon: 'Heart', title: 'Pasión por el pádel', description: 'Somos jugadores antes que vendedores' },
          { icon: 'Users', title: 'Atención personalizada', description: 'Te asesoramos según tu nivel y estilo' },
          { icon: 'Shield', title: 'Experiencia y confianza', description: 'Años en el mercado del pádel argentino' },
        ],
      },
      instagram: {
        title: 'Seguinos en Instagram',
        username: '@homepadel',
        buttonText: 'Ver perfil',
        buttonUrl: 'https://instagram.com/homepadel',
      },
      final_message: {
        title: 'Un mensaje para vos',
        text: 'Gracias por elegir Home Pádel. Cada compra nos impulsa a seguir creciendo y acercarte lo mejor del pádel. Vamos por más, juntos.',
        buttonText: 'Ver catálogo',
        buttonUrl: '/catalogo',
      },
    };
    return defaults[key];
  }
}
