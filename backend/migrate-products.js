// Migración específica para productos
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
    return await downloadImage(url);
  } catch (e) {
    const filename = url.replace('/uploads/', '');
    return await readLocalImage(filename);
  }
}

async function migrateProducts() {
  console.log('=== Migración de imágenes de productos ===\n');
  let migrated = 0;
  let lost = 0;
  const lostImages = [];

  // Obtener TODOS los productos (sin filtro where)
  const products = await prisma.product.findMany({
    select: { id: true, name: true, images: true }
  });

  // Filtrar en memoria
  const productsWithUploads = products.filter(p => 
    Array.isArray(p.images) && p.images.some(img => img.startsWith('/uploads/'))
  );

  console.log('Productos con /uploads/:', productsWithUploads.length, '\n');

  for (const product of productsWithUploads) {
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

  console.log('\n=== RESUMEN ===');
  console.log('Migradas exitosamente: ' + migrated);
  console.log('Perdidas (requieren re-subida): ' + lost);

  if (lostImages.length > 0) {
    // Actualizar reporte existente o crear nuevo
    let existingReport = [];
    try {
      existingReport = JSON.parse(fs.readFileSync('images-lost-report.json', 'utf8'));
    } catch {}
    const combinedReport = [...existingReport.filter(i => i.entity !== 'Producto'), ...lostImages];
    fs.writeFileSync('images-lost-report.json', JSON.stringify(combinedReport, null, 2));
    console.log('\nReporte actualizado: images-lost-report.json');
  }
}

migrateProducts()
  .then(() => {
    console.log('\nMigración de productos completada.');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  });
