const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  await p.fAQ.updateMany({ data: { category: 'COMPRAS' }, where: { category: 'COMPRAS' } });
  await p.fAQ.updateMany({ data: { category: 'ENVIOS' }, where: { category: 'ENVIOS' } });
  await p.fAQ.updateMany({ data: { category: 'PAGOS' }, where: { category: 'PAGOS' } });
  await p.fAQ.updateMany({ data: { category: 'DEVOLUCIONES' }, where: { category: 'DEVOLUCIONES' } });
  await p.fAQ.updateMany({ data: { category: 'GENERAL' }, where: { category: 'General' } });
  console.log('Categorias actualizadas');
}

main().finally(() => p.$disconnect());