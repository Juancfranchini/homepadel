import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

export type SectionKey = 'about' | 'instagram' | 'final_message' | 'branding' | 'settings';

@Injectable()
export class SiteSectionsService {
  constructor(private prisma: PrismaService) {}

  async findOne(key: SectionKey) {
    const section = await this.prisma.siteSection.findUnique({ where: { key } });
    return section ?? { key, data: this.getDefault(key), active: true };
  }

  async upsert(key: SectionKey, dto: { data: Record<string, unknown>; active?: boolean }) {
    // Si es branding, eliminar imagenes viejas antes de actualizar
    if (key === 'branding') {
      await this.removeOldImages(dto.data);
    }

    return this.prisma.siteSection.upsert({
      where: { key },
      update: { data: dto.data as Prisma.InputJsonValue, active: dto.active ?? true },
      create: { key, data: dto.data as Prisma.InputJsonValue, active: dto.active ?? true },
    });
  }

  // Elimina archivos de imagen que ya no estan en los nuevos datos
  private async removeOldImages(newData: Record<string, unknown>) {
    try {
      const existing = await this.prisma.siteSection.findUnique({ where: { key: 'branding' } });
      if (!existing?.data) return;

      const oldData = existing.data as Record<string, unknown>;
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

      const imageKeys = ['logoHeader', 'logoFooter', 'isotipo', 'logoMobile'];
      
      for (const key of imageKeys) {
        const oldUrl = oldData[key] as string;
        const newUrl = newData[key] as string;

        // Si habia una imagen y cambio, eliminar la vieja
        if (oldUrl && oldUrl !== newUrl && oldUrl.startsWith('/uploads/')) {
          const filename = oldUrl.replace('/uploads/', '');
          const filepath = path.join(uploadsDir, filename);
          
          try {
            if (fs.existsSync(filepath)) {
              fs.unlinkSync(filepath);
              console.log('Imagen eliminada:', filename);
            }
          } catch (err) {
            console.error('Error al eliminar imagen:', filename, err);
          }
        }
      }
    } catch (err) {
      console.error('Error en removeOldImages:', err);
    }
  }

  private getDefault(key: SectionKey): Record<string, unknown> {
    const defaults: Record<SectionKey, Record<string, unknown>> = {
      about: {
        title: 'Somos Home Padel',
        description: 'Vivimos el padel tanto como vos.',
        image: null,
        benefits: [],
      },
      instagram: {
        title: 'Seguinos en Instagram',
        username: '@homepadel',
        buttonText: 'Ver perfil',
        buttonUrl: 'https://instagram.com/homepadel',
      },
      settings: {
        storeName: 'Home Padel',
        contactEmail: 'hola@homepadel.com',
        phone: '',
        address: '',
        whatsapp: '',
      },
      branding: {
        logoHeader: null,
        logoFooter: null,
        isotipo: null,
        logoMobile: null,
      },
      final_message: {
        title: 'Un mensaje para vos',
        text: 'Gracias por elegir Home Padel.',
        buttonText: 'Ver catalogo',
        buttonUrl: '/catalogo',
      },
    };
    return defaults[key];
  }
}