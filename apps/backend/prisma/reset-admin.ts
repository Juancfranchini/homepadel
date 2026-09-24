// Script de emergencia para resetear/crear el usuario admin
// Uso: npx ts-node prisma/reset-admin.ts
// No toca ningún otro dato de la base de datos

import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../src/common/security/password';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@homepadel.com';
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) throw new Error('Falta SEED_ADMIN_PASSWORD para resetear el usuario administrador');

  const hashed = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed, role: Role.ADMIN },
    create: { email, password: hashed, name: 'Administrador', role: Role.ADMIN },
  });

  console.log(`✅ Admin listo: ${user.email}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
