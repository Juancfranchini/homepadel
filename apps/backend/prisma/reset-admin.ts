// Script de emergencia para resetear/crear el usuario admin
// Uso: npx ts-node prisma/reset-admin.ts
// No toca ningún otro dato de la base de datos

import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@homepadel.com';
  const password = 'admin123';

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed, role: Role.ADMIN },
    create: { email, password: hashed, name: 'Administrador', role: Role.ADMIN },
  });

  console.log(`✅ Admin listo: ${user.email} / ${password}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
