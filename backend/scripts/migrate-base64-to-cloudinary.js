// Script de migración de imágenes base64 a Cloudinary
// Uso: node scripts/migrate-base64-to-cloudinary.js
// Requiere credenciales Cloudinary configuradas en la BD (site_sections cloudinary)
// o en variable de entorno CLOUDINARY_URL

const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');

const prisma = new PrismaClient();

async function getCloudinaryConfig() {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ url: process.env.CLOUDINARY_URL });
    return true;
  }

  const config = await prisma.siteSection.findUnique({ where: { key: 'cloudinary' } });
  const data = (config?.data) || {};
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

function isBase64(str) {
  return typeof str === 'string' && str.startsWith('data:image/');
}

async function uploadBase64ToCloudinary(base64, folder = 'homepadel') {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(base64, {
      resource_type: 'image',
      folder: folder,
    }, (error, result) => {
      if (error) reject(error);
      else resolve(result.secure_url);
    });
  });
}

async function migrateProductImages() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, images: true },
  });

  let migrated = 0;
  let failed = 0;

  for (const product of products) {
    if (!product.images || product.images.length === 0) continue;

    const newImages = [];
    let changed = false;

    for (const img of product.images) {
      if (isBase64(img)) {
        try {
          console.log(`Migrando imagen de "${product.name}"...`);
          const newUrl = await uploadBase64ToCloudinary(img);
          newImages.push(newUrl);
          changed = true;
          migrated++;
          console.log(`  OK: ${newUrl}`);
        } catch (err) {
          console.error(`  ERROR: ${err.message}`);
          newImages.push(img);
          failed++;
        }
      } else {
        newImages.push(img);
      }
    }

    if (changed) {
      await prisma.product.update({
        where: { id: product.id },
        data: { images: newImages },
      });
      console.log(`Producto "${product.name}" actualizado con URLs de Cloudinary`);
    }
  }

  return { migrated, failed };
}

async function migrateOtherImages() {
  const tables = [
    { name: 'banner', field: 'image' },
    { name: 'category', field: 'image' },
    { name: 'brand', field: 'logo' },
    { name: 'heroSlide', field: 'image' },
  ];

  let totalMigrated = 0;

  for (const table of tables) {
    try {
      const records = await prisma[table.name].findMany({
        select: { id: true, [table.field]: true },
      });

      for (const record of records) {
        if (isBase64(record[table.field])) {
          try {
            console.log(`Migrando ${table.name} (${table.field})...`);
            const newUrl = await uploadBase64ToCloudinary(record[table.field]);
            await prisma[table.name].update({
              where: { id: record.id },
              data: { [table.field]: newUrl },
            });
            totalMigrated++;
            console.log(`  OK: ${newUrl}`);
          } catch (err) {
            console.error(`  ERROR: ${err.message}`);
          }
        }
      }
    } catch (err) {
      // Tabla no existe, ignorar
    }
  }

  return totalMigrated;
}

async function main() {
  console.log('=== Migración base64  Cloudinary ===\n');

  const configured = await getCloudinaryConfig();
  if (!configured) {
    console.error('ERROR: No hay credenciales de Cloudinary configuradas.');
    console.error('Configura las credenciales en el backoffice (Configuración  Cloudinary)');
    console.error('o define CLOUDINARY_URL en las variables de entorno.');
    process.exit(1);
  }

  console.log('Cloudinary configurado correctamente.\n');

  console.log('--- Migrando imágenes de productos ---');
  const productResult = await migrateProductImages();
  console.log(`Productos: ${productResult.migrated} migradas, ${productResult.failed} fallidas\n`);

  console.log('--- Migrando imágenes de otras tablas ---');
  const otherCount = await migrateOtherImages();
  console.log(`Otras: ${otherCount} migradas\n`);

  console.log('=== Migración completa ===');
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Error fatal:', err);
  await prisma.$disconnect();
  process.exit(1);
});