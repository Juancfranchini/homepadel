// Seed en JavaScript plano — compatible con el contenedor de producción.
// (prisma/seed.ts es excluido del nest build por tsconfig.build.json)
// Se ejecuta con: node prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Ejecutando seed...');

  // ── Admin user ─────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where:  { email: 'admin@homepadel.com' },
    update: { password: hashedPassword, role: 'ADMIN' },
    create: { email: 'admin@homepadel.com', password: hashedPassword, name: 'Administrador', role: 'ADMIN' },
  });

  // ── Categorías ──────────────────────────────────────────────────────────────
  const paletas     = await prisma.category.upsert({ where: { slug: 'paletas'     }, update: {}, create: { name: 'Paletas',      slug: 'paletas'     } });
  const zapatillas  = await prisma.category.upsert({ where: { slug: 'zapatillas'  }, update: {}, create: { name: 'Zapatillas',   slug: 'zapatillas'  } });
  const indumentaria= await prisma.category.upsert({ where: { slug: 'indumentaria'}, update: {}, create: { name: 'Indumentaria', slug: 'indumentaria'} });
  const accesorios  = await prisma.category.upsert({ where: { slug: 'accesorios'  }, update: {}, create: { name: 'Accesorios',   slug: 'accesorios'  } });

  // ── Marcas ──────────────────────────────────────────────────────────────────
  const nox      = await prisma.brand.upsert({ where: { slug: 'nox'      }, update: {}, create: { name: 'Nox',      slug: 'nox'      } });
  const bullpadel= await prisma.brand.upsert({ where: { slug: 'bullpadel'}, update: {}, create: { name: 'Bullpadel',slug: 'bullpadel'} });
  const adidas   = await prisma.brand.upsert({ where: { slug: 'adidas'   }, update: {}, create: { name: 'Adidas',   slug: 'adidas'   } });

  // ── Productos de ejemplo ───────────────────────────────────────────────────
  const products = [
    { name: 'Paleta Nox AT10 Genius 18K',    slug: 'paleta-nox-at10-genius-18k',    price: 437000, salePrice: 350000, sku: 'NOX-AT10-18K',  stock: 15, featured: true,  isNew: true,  categoryId: paletas.id,      brandId: nox.id       },
    { name: 'Zapatillas Bullpadel Vertex 23', slug: 'zapatillas-bullpadel-vertex-23', price: 120000, salePrice: null,   sku: 'BULL-VTX23',    stock: 30, featured: true,  isNew: false, categoryId: zapatillas.id,   brandId: bullpadel.id },
    { name: 'Paleta Bullpadel Hack 03',       slug: 'paleta-bullpadel-hack-03',       price: 235000, salePrice: 200000, sku: 'BULL-HACK03',   stock: 8,  featured: true,  isNew: false, categoryId: paletas.id,      brandId: bullpadel.id },
    { name: 'Remera Adidas Padel Basic',      slug: 'remera-adidas-padel-basic',      price: 80000,  salePrice: null,   sku: 'ADI-REM-BASIC', stock: 50, featured: false, isNew: false, categoryId: indumentaria.id, brandId: adidas.id    },
    { name: 'Overgrip Bullpadel Pack x3',     slug: 'overgrip-bullpadel-pack-x3',     price: 12000,  salePrice: null,   sku: 'BULL-OVG-3',    stock: 100,featured: false, isNew: false, categoryId: accesorios.id,   brandId: bullpadel.id },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where:  { sku: p.sku },
      update: {},
      create: { ...p, description: `Descripción de ${p.name}`, images: [], isOffer: false, active: true },
    });
  }

  console.log('✅ Seed completado');
}

main().catch((e) => {
  console.error('❌ Seed falló:', e.message);
  // No lanzamos el error — el servidor debe arrancar igual
}).finally(() => prisma.$disconnect());
