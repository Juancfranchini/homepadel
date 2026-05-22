// Script de seed para poblar la base de datos con datos iniciales
// Ejecutar con: npm run prisma:seed
// Crea: usuario admin, categorías, marcas y productos de ejemplo

import { PrismaClient, Role, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Admin user — update: incluye password para que re-correr el seed siempre corrija las credenciales
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@homepadel.com' },
    update: { password: hashedPassword, role: Role.ADMIN },
    create: {
      email: 'admin@homepadel.com',
      password: hashedPassword,
      name: 'Administrador',
      role: Role.ADMIN,
    },
  });

  // Categories
  const paletas = await prisma.category.upsert({
    where: { slug: 'paletas' },
    update: {},
    create: { name: 'Paletas', slug: 'paletas' },
  });
  const zapatillas = await prisma.category.upsert({
    where: { slug: 'zapatillas' },
    update: {},
    create: { name: 'Zapatillas', slug: 'zapatillas' },
  });
  const indumentaria = await prisma.category.upsert({
    where: { slug: 'indumentaria' },
    update: {},
    create: { name: 'Indumentaria', slug: 'indumentaria' },
  });
  const accesorios = await prisma.category.upsert({
    where: { slug: 'accesorios' },
    update: {},
    create: { name: 'Accesorios', slug: 'accesorios' },
  });

  // Brands
  const nox = await prisma.brand.upsert({
    where: { slug: 'nox' },
    update: {},
    create: { name: 'Nox', slug: 'nox' },
  });
  const bullpadel = await prisma.brand.upsert({
    where: { slug: 'bullpadel' },
    update: {},
    create: { name: 'Bullpadel', slug: 'bullpadel' },
  });

  // Sample products
  const products = [
    { name: 'Paleta Nox AT10 Genius 18K', slug: 'paleta-nox-at10-genius-18k', price: 437000, salePrice: 350000, sku: 'NOX-AT10-18K', stock: 15, featured: true, categoryId: paletas.id, brandId: nox.id },
    { name: 'Zapatillas Bullpadel Vertex 23', slug: 'zapatillas-bullpadel-vertex-23', price: 120000, sku: 'BULL-VTX23', stock: 30, featured: true, categoryId: zapatillas.id, brandId: bullpadel.id },
    { name: 'Paleta Bullpadel Hack 03', slug: 'paleta-bullpadel-hack-03', price: 235000, salePrice: 200000, sku: 'BULL-HACK03', stock: 8, featured: true, categoryId: paletas.id, brandId: bullpadel.id },
    { name: 'Remera Bullpadel Basic', slug: 'remera-bullpadel-basic', price: 80000, sku: 'BULL-REM-BASIC', stock: 50, featured: true, categoryId: indumentaria.id, brandId: bullpadel.id },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: { ...p, description: `Descripción de ${p.name}` },
    });
  }

  console.log('Seed completado');
}

main().catch(console.error).finally(() => prisma.$disconnect());
