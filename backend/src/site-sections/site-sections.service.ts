import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

export type SectionKey = 'categories' | 'meta_pixel' | 'hero' | 'benefits' | 'promo_destacada' | 'featured_products' | 'banners' | 'about' | 'testimonials' | 'brands' | 'instagram' | 'final_message' | 'branding' | 'settings' | 'trust_bottom' | 'politica_devolución' | 'envíos' | 'medios_pago' | 'terminos' | 'privacidad' | 'contacto' | 'talles' | 'reviews_info' | 'payment_methods' | 'email_settings';

@Injectable()
export class SiteSectionsService {
  constructor(private prisma: PrismaService) {}

  async findOne(key: SectionKey) {
    const section = await this.prisma.siteSection.findUnique({ where: { key } });
    return section ?? { key, data: this.getDefault(key), active: true };
  }

  async upsert(key: SectionKey, dto: { data: Record<string, unknown>; active?: boolean }) {
    if (key === 'branding') {
      await this.removeOldImages(dto.data);
    }

    if (key === 'meta_pixel') {
      await this.saveMetaPixelEnv(dto.data);
    }

    return this.prisma.siteSection.upsert({
      where: { key },
      update: { data: dto.data as Prisma.InputJsonValue, active: dto.active ?? true },
      create: { key, data: dto.data as Prisma.InputJsonValue, active: dto.active ?? true },
    });
  }

  private async saveMetaPixelEnv(data: Record<string, unknown>) {
    try {
      const accessToken = data.accessToken as string;
      const testEventCode = data.testEventCode as string;
      if (!accessToken) return;

      const envPath = path.join(__dirname, '..', '..', '.env');
      let envContent = '';

      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }

      const lines = envContent.split('\n');
      const newLines = lines.filter(line => 
        !line.startsWith('META_ACCESS_TOKEN=') && 
        !line.startsWith('META_TEST_EVENT_CODE=')
      );

      newLines.push('META_ACCESS_TOKEN=' + accessToken);
      if (testEventCode) {
        newLines.push('META_TEST_EVENT_CODE=' + testEventCode);
      }

      fs.writeFileSync(envPath, newLines.join('\n'), 'utf-8');
    } catch (err) {
      console.error('Error guardando Meta Pixel en .env:', err);
    }
  }

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
      hero: {},
      benefits: {},
      promo_destacada: {},
      featured_products: {},
      banners: {},
      testimonials: {},
      brands: {},
      categories: { title: 'Categorias', description: 'Encontra lo que necesitas para tu mejor version en la cancha.' },
      meta_pixel: {
        pixelId: '',
        testEventCode: '',
        events: {
          pageView: true,
          viewContent: true,
          addToCart: true,
          initiateCheckout: true,
          purchase: true,
          contact: true,
        },
      },
      'politica_devolución': { title: 'Politica de Devolución', content: '' },
      'envíos': { title: 'Envíos', sections: [{ title: 'Tiempos y costos', content: '' }] },
      'medios_pago': { title: 'Medios de Pago', content: '' },
      'terminos': { title: 'Terminos y Condiciones', content: '' },
      'privacidad': { title: 'Politica de Privacidad', content: '' },
      'contacto': { chip: 'ESTAMOS PARA AYUDARTE', title: 'Contactanos', description: 'Tenes dudas sobre nuestros productos, envíos o pagos? Nuestro equipo esta para ayudarte.', heroImage: '', mapUrl: '', newsletterTitle: 'ENTERATE DE LAS NOVEDADES', newsletterText: 'Suscribite y recibi ofertas exclusivas y lanzamientos.', heroActive: true, benefitsActive: true, channelsActive: true, faqActive: true, mapActive: true, newsletterActive: true },
      'talles': { title: 'Guia de Talles', content: '' },
      'payment_methods': { mercadopago: { active: true, publicKey: '', accessToken: '' }, transferencia: { active: true, cbu: '', alias: '', titular: '', banco: '' }, tarjeta: { active: false }, correo_argentino: { active: true, usuario: '', password: '', apiKey: '', agreement: '', remitente: { nombre: '', calle: '', número: '', ciudad: '', códigoPostal: '', provincia: '', teléfono: '' } }, oca: { active: false, usuario: '', password: '' }, andreani: { active: false, usuario: '', password: '' } },
      'email_settings': {
        resendApiKey: '',
        fromEmail: 'Home Padel <noreply@homepadel.com.ar>',
        adminEmail: 'contactohomepadel@gmail.com',
        notifications: {
          newOrder: true,
          shippedOrder: true,
          contactForm: true
        }
      },
      'reviews_info': { content: 'Las opiniones son realizadas por clientes verificados que compraron el producto. El promedio se calcula en base a todas las resenas aprobadas.' },
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
      trust_bottom: { items: [], active: true },
      final_message: {
        title: 'Un mensaje para vos',
        text: 'Gracias por elegir Home Padel.',
        buttonText: 'Ver catálogo',
        buttonUrl: '/catálogo',
      },
    };
    return defaults[key];
  }
}


