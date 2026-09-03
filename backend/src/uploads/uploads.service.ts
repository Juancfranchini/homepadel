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

    return { migrated, failed };
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const configured = await this.getCloudinaryConfig();
    if (!configured) {
      // Fallback: si no hay Cloudinary, guardar como base64 (temporal)
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