# Home Pádel — Plataforma Ecommerce

Plataforma ecommerce para venta de productos de pádel: tienda pública, API REST y panel de administración.

## Estructura del proyecto

```
homepadel/
├── apps/
│   ├── backend/       → API REST (NestJS 10 + Prisma 5 + PostgreSQL 16)
│   ├── frontend/      → Tienda pública (Next.js 15 + React 19)
│   └── backoffice/    → Panel admin (Next.js 15 + React 19)
├── packages/          → vacío — reservado para código compartido futuro (ver packages/README.md)
├── docs/              → Documentación por tema — ver docs/README.md
├── .cursor/rules/     → Reglas de Cursor (tamaño de código, validación, secretos)
└── CLAUDE.md          → Resumen de convenciones para agentes/IA
```

`apps/*` son tres proyectos Node independientes (cada uno con su propio `package.json`) agrupados en una carpeta — no hay pnpm workspaces ni turborepo todavía, cada uno se instala y corre por separado.

Documentación completa (arquitectura, convenciones de código, componentes, seguridad, deploy): **[docs/README.md](docs/README.md)**.

## Requisitos previos

- Node.js 20+
- npm
- No hace falta Postgres local: el desarrollo apunta directo a la base de Railway (u otra base en la nube) vía `DATABASE_URL`. No hay Docker en este proyecto.

## Puesta en marcha

### 1. Variables de entorno

Cada app tiene su propio `.env.example` **documentado** (qué es obligatorio, qué rompe si falta).

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/backoffice/.env.example apps/backoffice/.env.local
```

Revisar `apps/backend/.env.example` — trae comentarios de qué credenciales son obligatorias en producción (JWT, Mercado Pago, Cloudinary) y qué pasa si faltan. `DATABASE_URL` tiene que apuntar a una base Postgres accesible (Railway, u otra) — pedir la cadena de conexión de desarrollo al resto del equipo.

### 2. Backend

```bash
cd apps/backend
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed     # datos de ejemplo
npm run start:dev
```

- API: `http://localhost:4000/api`
- Swagger: `http://localhost:4000/api/docs`

### 3. Frontend (tienda pública)

```bash
cd apps/frontend
npm install
npm run dev
```

`http://localhost:3000`

### 4. Backoffice (panel admin)

```bash
cd apps/backoffice
npm install
npm run dev
```

`http://localhost:3001` — credenciales de seed: `admin@homepadel.com` / `admin123`

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, TailwindCSS 3, Zustand, React Hook Form + Zod, Axios |
| BackOffice | Next.js 15, React 19, TailwindCSS 3, TanStack Table, Recharts, TipTap (editor rich text), React Hook Form + Zod |
| Backend | NestJS 10, Prisma ORM 5, Passport (JWT + Local), class-validator/class-transformer, Swagger, Helmet, @nestjs/throttler, @nestjs/cache-manager |
| Base de datos | PostgreSQL 16 |
| Integraciones | Mercado Pago (checkout), Cloudinary (imágenes), Resend (emails transaccionales/campañas), Meta Conversions API (tracking, opcional) |
| Infraestructura | Railway (backend, build con Docker), Vercel (frontend/backoffice, implícito por config de CORS) |
| Tests | Jest (backend): firma de webhooks de pagos, cálculo de precios, sanitización de secciones del sitio |

## Módulos del backend (NestJS)

27 módulos bajo `/api`. Los principales, agrupados:

**Catálogo**
- `products` — CRUD, variantes (talle/color), destacados, ofertas, specs/highlights/performance en JSON
- `categories`, `brands` — CRUD con slug, orden, activo/inactivo
- `size-guides` — guías de talles por categoría/producto
- `reviews` — reseñas de producto (con moderación `verified`/`active`)

**Pedidos y pagos**
- `orders` — creación, estados (`PENDING → PAID → SHIPPED → DELIVERED`, o `CANCELLED`)
- `payments` — integración Mercado Pago (preferencias + webhook con verificación de firma)
- `pricing` — cálculo de precios (descuentos, cuotas, interés)
- `shipping` — cotización/gestión de envío (Correo Argentino por defecto)
- `track` — seguimiento de pedido + Meta Conversions API
- `coupons` — cupones por % o monto fijo, con vigencia y tope de usos

**Contenido / CMS de la home**
- `banners`, `hero-slides`, `benefits`, `testimonials`, `faq`, `promotions`, `contact-channels`, `site-sections` (bloques de contenido genéricos en JSON, con sanitización)

**Comunicación**
- `email` — plantillas y campañas (Resend)
- `newsletter` — suscripciones
- `contact` — formulario de contacto
- `instagram` — feed/integración

**Administración**
- `auth` — login/registro, JWT (7 días), guards de rol (`ADMIN`/`CUSTOMER`)
- `users` — gestión de clientes
- `dashboard` — métricas (ventas, pedidos, ticket promedio)
- `expenses` — gastos operativos
- `uploads` — subida de imágenes a Cloudinary
- `admin` — borrado con validación de dependencias (`delete-validation`)

## Módulos del BackOffice (rutas)

`banners`, `beneficios`, `categorias`, `clientes`, `configuracion`, `contacto`, `cupones`, `faq`, `hero`, `marcas`, `newsletter`, `pedidos`, `productos`, `productos-contenido`, `promociones`, `reviews`, `testimonios` — todo bajo el grupo de rutas `(dashboard)`, con `(auth)` separado para login.

## API — convenciones

Todos los endpoints están bajo `/api`. Lista completa y actualizada en Swagger (`/api/docs`) — no se duplica acá para evitar que quede desactualizada. Patrón general:

```
GET    /api/<recurso>              → listado (público o filtrado por rol)
GET    /api/<recurso>/:id|:slug    → detalle
POST   /api/<recurso>              → crear   (ADMIN, salvo auth/orders/reviews/contact/newsletter)
PATCH  /api/<recurso>/:id          → editar  (ADMIN)
DELETE /api/<recurso>/:id          → borrar  (ADMIN, valida dependencias)
```

Casos especiales: `POST /api/payments/webhook` (Mercado Pago, sin auth, verificado por firma), `POST /api/uploads/image` (ADMIN), `GET /api/orders/my` (usuario autenticado).

## Seguridad

- JWT (7 días de expiración) + Passport, guard de roles ADMIN/CUSTOMER, guard JWT opcional para endpoints mixtos público/autenticado
- bcrypt para contraseñas
- Helmet (headers HTTP)
- Rate limiting con `@nestjs/throttler` (100 req/60s por IP)
- Validación global de DTOs con `class-validator` (`whitelist` + `forbidNonWhitelisted`)
- Filtro global de excepciones de Prisma (no se filtran errores internos de DB al cliente)
- Verificación de firma de webhook de Mercado Pago (`MERCADOPAGO_WEBHOOK_SECRET`)
- CORS restringido en producción a `FRONTEND_URL`/`BACKOFFICE_URL` + subdominios `*.vercel.app`

## Tests

```bash
cd apps/backend
npm test
```

Cobertura actual: firma de webhooks de pago (`payments.signature.spec.ts`), cálculo de precios (`pricing.service.spec.ts`), sanitización de `site-sections` (`site-sections.sanitize.spec.ts`). Frontend y backoffice no tienen tests todavía.

## Linters

ESLint (flat config) + Prettier configurados en las tres apps. `npm run lint` **hoy no da limpio** — quedó así a propósito para que el lint muestre la deuda real (`any`, funciones largas, `catch` vacíos) en vez de esconderla; detalle de qué falta en [docs/backend.md](docs/backend.md) y [docs/convenciones-codigo.md](docs/convenciones-codigo.md).

```bash
cd apps/backend    && npm run lint    # o frontend / backoffice
npm run format:check              # Prettier, sin escribir
```

## Deploy

- **Backend**: Railway, build vía `apps/backend/Dockerfile`, healthcheck en `/api/docs`, `prisma migrate deploy` en `start:prod`.
- **Frontend / BackOffice**: preparados para Vercel (CORS del backend acepta cualquier `*.vercel.app`); requieren `NEXT_PUBLIC_API_URL` apuntando al backend desplegado.
