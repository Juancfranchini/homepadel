// Script de limpieza - F2: productos con salePrice = 0
// Cambia salePrice = 0 a NULL para que no se muestren como -100% OFF
// Uso: node scripts/clean-sale-price-zero.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== Limpieza de salePrice = 0 ===\n');

  const productsWithZero = await prisma.product.findMany({
    where: { salePrice: 0 },
    select: { id: true, name: true, price: true, salePrice: true },
  });

  console.log(`Productos con salePrice = 0: ${productsWithZero.length}\n`);

  for (const p of productsWithZero) {
    console.log(`- ${p.name} (precio: ${p.price})`);
  }

  if (productsWithZero.length === 0) {
    console.log('No hay productos para limpiar.');
    await prisma.$disconnect();
    return;
  }

  console.log('\nActualizando salePrice = 0 -> null...\n');

  const result = await prisma.product.updateMany({
    where: { salePrice: 0 },
    data: { salePrice: null },
  });

  console.log(`Productos actualizados: ${result.count}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Error:', err);
  await prisma.$disconnect();
  process.exit(1);
});