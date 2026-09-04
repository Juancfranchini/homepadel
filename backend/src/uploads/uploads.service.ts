import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadsService {
  constructor(private prisma: PrismaService) {}

  private async getCloudinaryConfig() {
    // Primero intentar variables de entorno
    if (process.env.CLOUDINARY_URL) {
      cloudinary.config({ url: process.env.CLOUDINARY_URL });
      return true;
    }

    // Luego intentar config guardada en la BD
    const config = await this.prisma.siteSection.findUnique({ where: { key: 'cloudinary' } });
    const data = (config?.data as any) || {};
    if (data.cloudName && data.apiKey && data.apiSecret) {
      cloudinary.config({
        cloud_name: data.cloudName,
        api_key: data.apiKey,
        api_secret: data.apiSecret,
      });
      return true;
    }

    return false;
  }

  async migrateToCloudinary() {
    const configured = await this.getCloudinaryConfig();
    if (!configured) {
      return { error: 'No hay credenciales Cloudinary configuradas', migrated: 0, failed: 0 };
    }

    let migrated = 0;
    let failed = 0;
    const fs = require('fs');
    const path = require('path');

    const products = await this.prisma.product.findMany({
      select: { id: true, name: true, images: true },
    });

    for (const product of products) {
      if (!product.images || product.images.length === 0) continue;
      const newImages = [];
      let changed = false;

      for (const img of product.images) {
        if (typeof img === 'string') {
          try {
            let sourceToUpload: string | Buffer = '';
            
            if (img.startsWith('data:image/')) {
              // Base64 directo
              sourceToUpload = img;
            } else if (img.startsWith('/uploads/')) {
              // Archivo local
              const filePath = path.join(__dirname, '..', '..', 'uploads', img.replace('/uploads/', ''));
              if (fs.existsSync(filePath)) {
                sourceToUpload = fs.readFileSync(filePath);
              } else {
                // Probar ruta alternativa
                const altPath = path.join(process.cwd(), 'uploads', img.replace('/uploads/', ''));
                if (fs.existsSync(altPath)) {
                  sourceToUpload = fs.readFileSync(altPath);
                } else {
                  newImages.push(img);
                  continue;
                }
              }
            } else {
              // Ya es URL de Cloudinary u otra
              newImages.push(img);
              continue;
            }

            const newUrl = await new Promise<string>((resolve, reject) => {
              cloudinary.uploader.upload_stream(
                { resource_type: 'image', folder: 'homepadel' },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result.secure_url);
                }
              ).end(sourceToUpload);
            });
            
            newImages.push(newUrl);
            changed = true;
            migrated++;
          } catch {
            newImages.push(img);
            failed++;
          }
        } else {
          newImages.push(img);
        }
      }

      if (changed) {
        await this.prisma.product.update({
          where: { id: product.id },
          data: { images: newImages },
        });
      }
    }

    // Migrar categorías
    const categories = await this.prisma.category.findMany({
      select: { id: true, name: true, image: true },
    });

    for (const cat of categories) {
      if (!cat.image) continue;
      try {
        let sourceToUpload: string | Buffer = '';
        if (cat.image.startsWith('data:image/')) {
          sourceToUpload = cat.image;
        } else if (cat.image.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), 'uploads', cat.image.replace('/uploads/', ''));
          if (fs.existsSync(filePath)) {
            sourceToUpload = fs.readFileSync(filePath);
          } else {
            continue;
          }
        } else {
          continue;
        }

        const newUrl = await new Promise<string>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: 'image', folder: 'homepadel/categories' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          ).end(sourceToUpload);
        });

        await this.prisma.category.update({ where: { id: cat.id }, data: { image: newUrl } });
        migrated++;
      } catch {
        failed++;
      }
    }

    // Migrar marcas
    const brands = await this.prisma.brand.findMany({
      select: { id: true, name: true, logo: true },
    });

    for (const brand of brands) {
      if (!brand.logo) continue;
      try {
        let sourceToUpload: string | Buffer = '';
        if (brand.logo.startsWith('data:image/')) {
          sourceToUpload = brand.logo;
        } else if (brand.logo.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), 'uploads', brand.logo.replace('/uploads/', ''));
          if (fs.existsSync(filePath)) {
            sourceToUpload = fs.readFileSync(filePath);
          } else {
            continue;
          }
        } else {
          continue;
        }

        const newUrl = await new Promise<string>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: 'image', folder: 'homepadel/brands' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          ).end(sourceToUpload);
        });

        await this.prisma.brand.update({ where: { id: brand.id }, data: { logo: newUrl } });
        migrated++;
      } catch {
        failed++;
      }
    }

    // Migrar banners
    const banners = await this.prisma.banner.findMany({
      select: { id: true, title: true, image: true },
    });

    for (const banner of banners) {
      if (!banner.image) continue;
      try {
        let sourceToUpload: string | Buffer = '';
        if (banner.image.startsWith('data:image/')) {
          sourceToUpload = banner.image;
        } else if (banner.image.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), 'uploads', banner.image.replace('/uploads/', ''));
          if (fs.existsSync(filePath)) {
            sourceToUpload = fs.readFileSync(filePath);
          } else {
            continue;
          }
        } else {
          continue;
        }

        const newUrl = await new Promise<string>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: 'image', folder: 'homepadel/banners' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          ).end(sourceToUpload);
        });

        await this.prisma.banner.update({ where: { id: banner.id }, data: { image: newUrl } });
        migrated++;
      } catch {
        failed++;
      }
    }

    const heroSlides = await this.prisma.heroSlide.findMany({
      select: { id: true, image: true, imageMobile: true },
    });
    for (const slide of heroSlides) {
      const data: { image?: string | null; imageMobile?: string | null } = {};
      let changed = false;
      for (const field of ['image', 'imageMobile'] as const) {
        const value = slide[field];
        if (!value || !value.startsWith('data:image/')) continue;
        try {
          data[field] = await this.uploadBase64(value, 'homepadel/hero-slides');
          changed = true;
          migrated++;
        } catch {
          failed++;
        }
      }
      if (changed) {
        await this.prisma.heroSlide.update({ where: { id: slide.id }, data });
      }
    }

    const contactChannels = await this.prisma.contactChannel.findMany({
      select: { id: true, logo: true },
    });
    for (const channel of contactChannels) {
      if (!channel.logo || !channel.logo.startsWith('data:image/')) continue;
      try {
        const logo = await this.uploadBase64(channel.logo, 'homepadel/contact-channels');
        await this.prisma.contactChannel.update({ where: { id: channel.id }, data: { logo } });
        migrated++;
      } catch {
        failed++;
      }
    }

    const sections = await this.prisma.siteSection.findMany({
      select: { id: true, data: true },
    });
    for (const section of sections) {
      const result = await this.migrateJsonImages(section.data, 'homepadel/site-sections');
      if (result.migrated > 0) {
        await this.prisma.siteSection.update({
          where: { id: section.id },
          data: { data: result.value as any },
        });
      }
      migrated += result.migrated;
      failed += result.failed;
    }

    return { migrated, failed };
  }

  private uploadBase64(base64: string, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder },
        (error, result) => {
          if (error) reject(error);
          else if (!result?.secure_url) reject(new Error('Cloudinary no devolvió una URL'));
          else resolve(result.secure_url);
        },
      ).end(base64);
    });
  }

  private async migrateJsonImages(value: unknown, folder: string): Promise<{ value: unknown; migrated: number; failed: number }> {
    if (typeof value === 'string') {
      if (!value.startsWith('data:image/')) return { value, migrated: 0, failed: 0 };
      try {
        return { value: await this.uploadBase64(value, folder), migrated: 1, failed: 0 };
      } catch {
        return { value, migrated: 0, failed: 1 };
      }
    }
    if (Array.isArray(value)) {
      const results = await Promise.all(value.map((item) => this.migrateJsonImages(item, folder)));
      return {
        value: results.map((result) => result.value),
        migrated: results.reduce((sum, result) => sum + result.migrated, 0),
        failed: results.reduce((sum, result) => sum + result.failed, 0),
      };
    }
    if (value && typeof value === 'object') {
      const entries = await Promise.all(
        Object.entries(value as Record<string, unknown>).map(async ([key, item]) => [key, await this.migrateJsonImages(item, folder)] as const),
      );
      return {
        value: Object.fromEntries(entries.map(([key, result]) => [key, result.value])),
        migrated: entries.reduce((sum, [, result]) => sum + result.migrated, 0),
        failed: entries.reduce((sum, [, result]) => sum + result.failed, 0),
      };
    }
    return { value, migrated: 0, failed: 0 };
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const configured = await this.getCloudinaryConfig();
    if (!configured) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Cloudinary no está configurado en producción');
      }
      const base64 = file.buffer.toString('base64');
      return `data:${file.mimetype};base64,${base64}`;
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'homepadel',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );
      uploadStream.end(file.buffer);
    });
  }
}