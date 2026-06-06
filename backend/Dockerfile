FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Copiar schema de Prisma (necesario para prisma generate)
COPY prisma ./prisma/

# Instalar TODAS las dependencias (incluyendo devDeps para @nestjs/cli)
RUN npm install --include=dev

# Copiar el código fuente
COPY . .

# Build: prisma generate + nest build → genera dist/
RUN npm run build

EXPOSE 4000

# Migraciones al iniciar, luego levantar la app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
