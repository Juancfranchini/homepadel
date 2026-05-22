# Home Pádel — Plataforma Ecommerce

Plataforma ecommerce profesional para venta de productos de pádel con panel de administración.

## Estructura del proyecto

```
homepadel/
├── backend/          → API REST (NestJS + Prisma + PostgreSQL)
├── frontend/         → Tienda pública (Next.js 15 + TailwindCSS)
├── backoffice/       → Panel admin (Next.js + TailwindCSS)
├── docker-compose.yml
└── .env.example
```

## Requisitos previos

- Node.js 20+
- Docker & Docker Compose
- npm o yarn

## Inicio rápido

### 1. Clonar y configurar variables de entorno

```bash
cp .env.example .env
cp backend/.env.example backend/.env    # ya existe con valores por defecto
cp frontend/.env.example frontend/.env.local
cp backoffice/.env.example backoffice/.env.local
```

### 2. Levantar PostgreSQL con Docker

```bash
docker compose up -d
```

Esto levanta:
- **PostgreSQL** en `localhost:5432`
- **pgAdmin** en `http://localhost:5050` (admin@homepadel.com / admin123)

### 3. Instalar dependencias y configurar Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed     # carga datos de ejemplo
npm run start:dev
```

El backend queda disponible en:
- API: `http://localhost:4000/api`
- Swagger: `http://localhost:4000/api/docs`

### 4. Instalar y correr Frontend

```bash
cd frontend
npm install
npm run dev
```

Disponible en: `http://localhost:3000`

### 5. Instalar y correr BackOffice

```bash
cd backoffice
npm install
npm run dev
```

Disponible en: `http://localhost:3001`

Credenciales por defecto:
- Email: `admin@homepadel.com`
- Password: `admin123`

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, TailwindCSS, Zustand |
| BackOffice | Next.js 15, TailwindCSS, TanStack Table, Recharts |
| Backend | NestJS, Prisma ORM, JWT, Swagger, Multer |
| Base de datos | PostgreSQL 16 |
| Infraestructura | Docker, Nginx (producción), Certbot SSL |

## Módulos del BackOffice

- **Dashboard** — métricas de ventas, pedidos, ticket promedio, gráficos
- **Productos** — CRUD completo con imágenes, precios, stock, destacados
- **Categorías** — gestión de categorías
- **Marcas** — gestión de marcas
- **Pedidos** — seguimiento con estados: Pendiente → Pagado → Enviado → Entregado
- **Clientes** — lista y detalle de usuarios registrados
- **Promociones** — crear promociones con fecha de vigencia
- **Banners** — administrar banners del home
- **Cupones** — códigos de descuento (porcentaje o monto fijo)
- **Gastos** — registro de gastos operativos
- **Configuración** — datos de la tienda, seguridad

## API endpoints principales

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/products?page=1&limit=20&category=paletas
GET    /api/products/featured
GET    /api/products/:slug
POST   /api/products          (ADMIN)
PATCH  /api/products/:id      (ADMIN)
DELETE /api/products/:id      (ADMIN)

GET    /api/categories
GET    /api/brands
GET    /api/orders             (ADMIN)
GET    /api/orders/my
POST   /api/orders
PATCH  /api/orders/:id/status  (ADMIN)

POST   /api/uploads/image      (ADMIN)
```

## Seguridad

- JWT (7 días de expiración)
- bcrypt para contraseñas
- Helmet (HTTP headers)
- Rate limiting (100 req/60s por IP)
- Validación de DTOs con class-validator
- Guards de roles (ADMIN / CUSTOMER)
