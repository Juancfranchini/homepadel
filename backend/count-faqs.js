const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const count = await p.fAQ.count();
  console.log('Total FAQs:', count);
  const all = await p.fAQ.findMany({ take: 3 });
  console.log('Primeras 3:', JSON.stringify(all, null, 2));
}
main().finally(() => process.exit());