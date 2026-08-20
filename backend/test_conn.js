const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.$connect().then(() => console.log('Conexion exitosa')).catch(e => console.error('Error:', e.message)).finally(() => p.$disconnect());