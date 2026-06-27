const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const all = await p.fAQ.findMany({ select: { id: true, question: true } });
  console.log('Total:', all.length);
  all.forEach(f => console.log(f.id.substring(0, 30), '->', f.question));
}
main().finally(() => process.exit());