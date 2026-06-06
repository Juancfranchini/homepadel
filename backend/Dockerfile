# ─── Stage 1: Builder ─────────────────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Instalar todo (devDeps incluidas para @nestjs/cli)
RUN npm install --include=dev

COPY . .

# Build: prisma generate + nest build → genera dist/
RUN npm run build

# ─── Stage 2: Production ──────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Solo dependencias de producción
RUN npm install --omit=dev

# Copiar el código compilado del builder
COPY --from=builder /app/dist ./dist

# Copiar Prisma client generado y CLI (necesario para migrate deploy)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

EXPOSE 4000

CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main"]
