// Migra imágenes almacenadas como base64 o /uploads/ a Cloudinary.
// Uso: node scripts/migrate-base64-to-cloudinary.js

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');

const prisma = new PrismaClient();
const uploadsDir = path.join(process.cwd(), 'uploads');

async function configureCloudinary() {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ url: process.env.CLOUDINARY_URL });
    return true;
  }

  const config = await prisma.siteSection.findUnique({ where: { key: 'cloudinary' } });
  const data = config?.data || {};
  if (!data.cloudName || !data.apiKey || !data.apiSecret) return false;

  cloudinary.config({
    cloud_name: data.cloudName,
    api_key: data.apiKey,
    api_secret: data.apiSecret,
  });
  return true;
}

function isImage(value) {
  return typeof value === 'string' &&
    (value.startsWith('data:image/') || value.startsWith('/uploads/'));
}

function localUploadPath(value) {
  const filename = value.replace(/^\/uploads\//, '');
  return path.join(uploadsDir, filename);
}

async function uploadImage(value, folder) {
  let source = value;
  if (value.startsWith('/uploads/')) {
    const filePath = localUploadPath(value);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo local inexistente: ${filePath}`);
    }
    source = fs.readFileSync(filePath);
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image', folder },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) return reject(new Error('Cloudinary no devolvió una URL'));
        resolve(result.secure_url);
      },
    );
    stream.end(source);
  });
}

async function migrateValue(value, folder, label, stats) {
  if (isImage(value)) {
    try {
      const url = await uploadImage(value, folder);
      stats.migrated++;
      console.log(`OK ${label}: ${url}`);
      return url;
    } catch (error) {
      stats.failed++;
      stats.failures.push(`${label}: ${error.message}`);
      console.error(`ERROR ${label}: ${error.message}`);
      return value;
    }
  }

  if (Array.isArray(value)) {
    const migrated = [];
    for (let index = 0; index < value.length; index++) {
      migrated.push(await migrateValue(value[index], folder, `${label}[${index}]`, stats));
    }
    return migrated;
  }

  if (value && typeof value === 'object') {
    const migrated = {};
    for (const [key, child] of Object.entries(value)) {
      migrated[key] = await migrateValue(child, folder, `${label}.${key}`, stats);
    }
    return migrated;
  }

  return value;
}

async function migrateProducts(stats) {
  const products = await prisma.product.findMany({ select: { id: true, name: true, images: true } });
  for (const product of products) {
    const images = await migrateValue(product.images, 'homepadel/products', `product:${product.name}`, stats);
    if (JSON.stringify(images) !== JSON.stringify(product.images)) {
      await prisma.product.update({ where: { id: product.id }, data: { images } });
    }
  }
}

async function migrateScalar(model, field, folder, stats) {
  const records = await prisma[model].findMany({ select: { id: true, [field]: true } });
  for (const record of records) {
    const value = record[field];
    if (!isImage(value)) continue;
    const migrated = await migrateValue(value, folder, `${model}:${record.id}.${field}`, stats);
    if (migrated !== value) {
      await prisma[model].update({ where: { id: record.id }, data: { [field]: migrated } });
    }
  }
}

async function migrateSiteSections(stats) {
  const sections = await prisma.siteSection.findMany({ select: { id: true, key: true, data: true } });
  for (const section of sections) {
    const data = await migrateValue(section.data, 'homepadel/site-sections', `siteSection:${section.key}`, stats);
    if (JSON.stringify(data) !== JSON.stringify(section.data)) {
      await prisma.siteSection.update({ where: { id: section.id }, data: { data } });
    }
  }
}

async function main() {
  if (!(await configureCloudinary())) {
    throw new Error('Cloudinary no está configurado');
  }

  const stats = { migrated: 0, failed: 0, failures: [] };
  await migrateProducts(stats);
  await migrateScalar('category', 'image', 'homepadel/categories', stats);
  await migrateScalar('brand', 'logo', 'homepadel/brands', stats);
  await migrateScalar('banner', 'image', 'homepadel/banners', stats);
  await migrateScalar('heroSlide', 'image', 'homepadel/hero-slides', stats);
  await migrateScalar('heroSlide', 'imageMobile', 'homepadel/hero-slides', stats);
  await migrateScalar('contactChannel', 'logo', 'homepadel/contact-channels', stats);
  await migrateSiteSections(stats);

  console.log(`Migradas: ${stats.migrated}`);
  console.log(`Fallidas: ${stats.failed}`);
  if (stats.failures.length) {
    console.error('Detalle de fallos:');
    stats.failures.forEach((failure) => console.error(`- ${failure}`));
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(`Error fatal: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
