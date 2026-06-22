const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.fAQ.findMany({ distinct: ['category'], select: { category: true } })
  .then(r => { console.log('Categorias en BD:'); r.forEach(c => console.log('-', c.category)); })
  .finally(() => p.$disconnect());