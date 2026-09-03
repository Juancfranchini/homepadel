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

    const products = await this.prisma.product.findMany({
      select: { id: true, name: true, images: true },
    });

    for (const product of products) {
      if (!product.images || product.images.length === 0) continue;
      const newImages = [];
      let changed = false;

      for (const img of product.images) {
        if (typeof img === 'string' && img.startsWith('data:image/')) {
          try {
            const newUrl = await new Promise<string>((resolve, reject) => {
              cloudinary.uploader.upload(img, {
                resource_type: 'image',
                folder: 'homepadel',
              }, (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              });
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