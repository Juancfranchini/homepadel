// Script de migración de imágenes /uploads/ a base64
// 1. Descarga imágenes accesibles desde Railway
// 2. Lee imágenes desde carpeta local
// 3. Actualiza la BD
// 4. Genera reporte de imágenes perdidas

const { PrismaClient } = require('@prisma/client');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const PRODUCTION_URL = 'https://homepadel-production.up.railway.app';
const LOCAL_UPLOADS_DIR = path.join(__dirname, 'uploads');

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const fullUrl = url.startsWith('http') ? url : PRODUCTION_URL + url;
    const client = fullUrl.startsWith('https') ? https : http;
    client.get(fullUrl, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error('Status ' + res.statusCode));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const mimeType = res.headers['content-type'] || 'image/png';
        const base64 = buffer.toString('base64');
        resolve('data:' + mimeType + ';base64,' + base64);
      });
    }).on('error', reject);
  });
}

function readLocalImage(filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(LOCAL_UPLOADS_DIR, filename);
    if (!fs.existsSync(filepath)) {
      reject(new Error('No existe localmente: ' + filename));
      return;
    }
    const buffer = fs.readFileSync(filepath);
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp' };
    const mimeType = mimeTypes[ext] || 'image/png';
    const base64 = buffer.toString('base64');
    resolve('data:' + mimeType + ';base64,' + base64);
  });
}

async function convertImage(url) {
  try {
    // Primero intentar descargar desde Railway
    return await downloadImage(url);
  } catch (e) {
    // Si falla, intentar leer localmente
    const filename = url.replace('/uploads/', '');
    return await readLocalImage(filename);
  }
}

async function migrate() {
  console.log('=== Migración de imágenes /uploads/ a base64 ===\n');
  let migrated = 0;
  let lost = 0;
  const lostImages = [];

  // === PRODUCTOS ===
  console.log('Migrando productos...');
  const products = await prisma.product.findMany({
    where: { images: { has: '/uploads/' } },
    select: { id: true, name: true, images: true }
  });
  
  for (const product of products) {
    const newImages = [];
    for (const img of product.images) {
      if (img.startsWith('/uploads/')) {
        try {
          const base64 = await convertImage(img);
          newImages.push(base64);
          migrated++;
          console.log('  [OK] ' + product.name + ': ' + img.split('/').pop());
        } catch (e) {
          newImages.push(img);
          lost++;
          lostImages.push({ entity: 'Producto', name: product.name, url: img });
          console.log('  [LOST] ' + product.name + ': ' + img.split('/').pop());
        }
      } else {
        newImages.push(img);
      }
    }
    await prisma.product.update({ where: { id: product.id }, data: { images: newImages } });
  }
  console.log('  Productos procesados: ' + products.length + '\n');

  // === CATEGORÍAS ===
  console.log('Migrando categorías...');
  const categories = await prisma.category.findMany({
    where: { image: { startsWith: '/uploads/' } },
    select: { id: true, name: true, image: true }
  });
  for (const cat of categories) {
    try {
      const base64 = await convertImage(cat.image);
      await prisma.category.update({ where: { id: cat.id }, data: { image: base64 } });
      migrated++;
      console.log('  [OK] ' + cat.name);
    } catch (e) {
      lost++;
      lostImages.push({ entity: 'Categoría', name: cat.name, url: cat.image });
      console.log('  [LOST] ' + cat.name);
    }
  }
  console.log('  Categorías procesadas: ' + categories.length + '\n');

  // === BANNERS ===
  console.log('Migrando banners...');
  const banners = await prisma.banner.findMany({
    where: { OR: [{ image: { startsWith: '/uploads/' } }, { imageMobile: { startsWith: '/uploads/' } }] },
    select: { id: true, title: true, image: true, imageMobile: true }
  });
  for (const banner of banners) {
    const updates = {};
    if (banner.image && banner.image.startsWith('/uploads/')) {
      try {
        updates.image = await convertImage(banner.image);
        migrated++;
        console.log('  [OK] Banner "' + banner.title + '" (image)');
      } catch (e) {
        lost++;
        lostImages.push({ entity: 'Banner', name: banner.title, url: banner.image });
        console.log('  [LOST] Banner "' + banner.title + '" (image)');
      }
    }
    if (banner.imageMobile && banner.imageMobile.startsWith('/uploads/')) {
      try {
        updates.imageMobile = await convertImage(banner.imageMobile);
        migrated++;
        console.log('  [OK] Banner "' + banner.title + '" (imageMobile)');
      } catch (e) {
        lost++;
        lostImages.push({ entity: 'Banner', name: banner.title, url: banner.imageMobile });
        console.log('  [LOST] Banner "' + banner.title + '" (imageMobile)');
      }
    }
    if (Object.keys(updates).length > 0) {
      await prisma.banner.update({ where: { id: banner.id }, data: updates });
    }
  }
  console.log('  Banners procesados: ' + banners.length + '\n');

  // === HERO SLIDES ===
  console.log('Migrando hero slides...');
  const heroes = await prisma.heroSlide.findMany({
    where: { OR: [{ image: { startsWith: '/uploads/' } }, { imageMobile: { startsWith: '/uploads/' } }] },
    select: { id: true, title: true, image: true, imageMobile: true }
  });
  for (const hero of heroes) {
    const updates = {};
    if (hero.image && hero.image.startsWith('/uploads/')) {
      try {
        updates.image = await convertImage(hero.image);
        migrated++;
        console.log('  [OK] Hero "' + hero.title + '" (image)');
      } catch (e) {
        lost++;
        lostImages.push({ entity: 'Hero', name: hero.title, url: hero.image });
        console.log('  [LOST] Hero "' + hero.title + '" (image)');
      }
    }
    if (hero.imageMobile && hero.imageMobile.startsWith('/uploads/')) {
      try {
        updates.imageMobile = await convertImage(hero.imageMobile);
        migrated++;
        console.log('  [OK] Hero "' + hero.title + '" (imageMobile)');
      } catch (e) {
        lost++;
        lostImages.push({ entity: 'Hero', name: hero.title, url: hero.imageMobile });
        console.log('  [LOST] Hero "' + hero.title + '" (imageMobile)');
      }
    }
    if (Object.keys(updates).length > 0) {
      await prisma.heroSlide.update({ where: { id: hero.id }, data: updates });
    }
  }
  console.log('  Hero slides procesados: ' + heroes.length + '\n');

  // === CANALES DE CONTACTO ===
  console.log('Migrando canales de contacto...');
  const channels = await prisma.contactChannel.findMany({
    where: { logo: { startsWith: '/uploads/' } },
    select: { id: true, title: true, logo: true }
  });
  for (const ch of channels) {
    try {
      const base64 = await convertImage(ch.logo);
      await prisma.contactChannel.update({ where: { id: ch.id }, data: { logo: base64 } });
      migrated++;
      console.log('  [OK] ' + ch.title);
    } catch (e) {
      lost++;
      lostImages.push({ entity: 'Contacto', name: ch.title, url: ch.logo });
      console.log('  [LOST] ' + ch.title);
    }
  }
  console.log('  Canales procesados: ' + channels.length + '\n');

  // === SITE SECTIONS ===
  console.log('Migrando site sections...');
  const sections = await prisma.siteSection.findMany();
  for (const section of sections) {
    const data = section.data || {};
    let changed = false;
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && value.startsWith('/uploads/')) {
        try {
          data[key] = await convertImage(value);
          migrated++;
          changed = true;
          console.log('  [OK] ' + section.key + '.' + key);
        } catch (e) {
          lost++;
          lostImages.push({ entity: 'SiteSection', name: section.key + '.' + key, url: value });
          console.log('  [LOST] ' + section.key + '.' + key);
        }
      }
    }
    if (changed) {
      await prisma.siteSection.update({ where: { id: section.id }, data: { data } });
    }
  }
  console.log('  Site sections procesadas: ' + sections.length + '\n');

  // === REPORTE ===
  console.log('=== RESUMEN ===');
  console.log('Migradas exitosamente: ' + migrated);
  console.log('Perdidas (requieren re-subida): ' + lost);
  
  if (lostImages.length > 0) {
    const reportFilename = 'images-lost-report.json';
    fs.writeFileSync(reportFilename, JSON.stringify(lostImages, null, 2));
    console.log('\nReporte de imágenes perdidas: ' + reportFilename);
    console.log('Estas imágenes deben ser reemplazadas por el cliente.');
  }
}

migrate()
  .then(() => {
    console.log('\nMigración completada.');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Error durante la migración:', e);
    process.exit(1);
  });
