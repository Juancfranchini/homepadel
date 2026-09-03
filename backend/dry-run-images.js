// Script dry-run: verifica qué imágenes /uploads/ son accesibles desde Railway
// NO modifica la BD
const { PrismaClient } = require('@prisma/client');
const https = require('https');
const http = require('http');

const prisma = new PrismaClient();
const PRODUCTION_URL = 'https://homepadel-production.up.railway.app';

function checkImage(url) {
  return new Promise((resolve) => {
    const fullUrl = url.startsWith('http') ? url : PRODUCTION_URL + url;
    const client = fullUrl.startsWith('https') ? https : http;
    client.get(fullUrl, (res) => {
      resolve({ url: fullUrl, status: res.statusCode, ok: res.statusCode === 200 });
      res.resume();
    }).on('error', (e) => {
      resolve({ url: fullUrl, status: 0, ok: false, error: e.message });
    });
  });
}

async function dryRun() {
  console.log('=== DRY RUN: Verificación de imágenes accesibles ===\n');
  let accessible = 0;
  let inaccessible = 0;
  const failed = [];

  // Recopilar todas las imágenes
  const allImages = [];
  
  const products = await prisma.product.findMany({ select: { id: true, name: true, images: true } });
  for (const p of products) {
    for (const img of p.images) {
      if (img.startsWith('/uploads/')) allImages.push({ entity: 'product', name: p.name, url: img });
    }
  }
  
  const categories = await prisma.category.findMany({ select: { id: true, name: true, image: true } });
  for (const c of categories) {
    if (c.image && c.image.startsWith('/uploads/')) allImages.push({ entity: 'category', name: c.name, url: c.image });
  }
  
  const banners = await prisma.banner.findMany({ select: { id: true, title: true, image: true, imageMobile: true } });
  for (const b of banners) {
    if (b.image && b.image.startsWith('/uploads/')) allImages.push({ entity: 'banner', name: b.title, url: b.image });
    if (b.imageMobile && b.imageMobile.startsWith('/uploads/')) allImages.push({ entity: 'banner', name: b.title, url: b.imageMobile });
  }
  
  const heroes = await prisma.heroSlide.findMany({ select: { id: true, title: true, image: true, imageMobile: true } });
  for (const h of heroes) {
    if (h.image && h.image.startsWith('/uploads/')) allImages.push({ entity: 'hero', name: h.title, url: h.image });
    if (h.imageMobile && h.imageMobile.startsWith('/uploads/')) allImages.push({ entity: 'hero', name: h.title, url: h.imageMobile });
  }
  
  const channels = await prisma.contactChannel.findMany({ select: { id: true, title: true, logo: true } });
  for (const ch of channels) {
    if (ch.logo && ch.logo.startsWith('/uploads/')) allImages.push({ entity: 'contact', name: ch.title, url: ch.logo });
  }
  
  const sections = await prisma.siteSection.findMany();
  for (const s of sections) {
    const data = s.data || {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && value.startsWith('/uploads/')) {
        allImages.push({ entity: 'siteSection', name: s.key + '.' + key, url: value });
      }
    }
  }

  console.log('Total imágenes /uploads/ encontradas:', allImages.length, '\n');
  
  // Verificar cada imagen (en lotes de 10 para no saturar)
  const batchSize = 10;
  for (let i = 0; i < allImages.length; i += batchSize) {
    const batch = allImages.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(img => checkImage(img.url)));
    for (let j = 0; j < results.length; j++) {
      const img = batch[j];
      const result = results[j];
      if (result.ok) {
        accessible++;
        console.log('  [OK]', img.entity + ':', img.name, '->', result.status);
      } else {
        inaccessible++;
        failed.push({ ...img, status: result.status, error: result.error });
        console.log('  [FAIL]', img.entity + ':', img.name, '->', result.status || result.error);
      }
    }
    if (i + batchSize < allImages.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log('\n=== Resultado dry-run ===');
  console.log('Accesibles:', accessible);
  console.log('No accesibles:', inaccessible);
  if (failed.length > 0) {
    console.log('\nDetalles de fallidas:');
    failed.forEach(f => console.log('  -', f.entity + ':', f.name, '(' + f.url + ')'));
  }
  
  process.exit(0);
}

dryRun();
