# Arquitectura

## Vista general

Tres aplicaciones Node independientes, sin monorepo ni código compartido entre ellas. Se comunican solo por HTTP contra la API del backend.

```
┌─────────────┐        ┌─────────────┐
│  frontend   │        │ backoffice  │   Next.js 15, independientes entre sí
│ (tienda)    │        │  (admin)    │
└──────┬──────┘        └──────┬──────┘
       │  fetch/axios         │  fetch/axios
       │  NEXT_PUBLIC_API_URL │  NEXT_PUBLIC_API_URL
       └──────────┬───────────┘
                   ▼
            ┌─────────────┐
            │   backend   │   NestJS, /api/*
            │  (API REST) │
            └──────┬──────┘
                    │ Prisma
                    ▼
            ┌─────────────┐
            │ PostgreSQL  │
            └─────────────┘

Servicios externos desde el backend: Mercado Pago (pagos),
Cloudinary (imágenes), Resend (email), Meta Conversions API (tracking, opcional).
```

- Ninguna de las dos apps Next.js llama directo a Mercado Pago, Cloudinary u otro tercero desde el browser — todo pasa por `backend`. Esto es intencional: el backend es el único que conoce las credenciales de esos servicios y el único que puede confiar en lo que le llega (ver [seguridad.md](seguridad.md)).
- `frontend` y `backoffice` no comparten componentes, tipos ni utilidades — cada uno tiene su propia copia. Es deuda conocida (código duplicado entre los dos), no una decisión de diseño; ver nota al final de este doc.
- No hay capa de dominio separada del framework (a diferencia de un monorepo con `packages/core`): la lógica de negocio vive dentro de los `*.service.ts` de cada módulo NestJS, junto al acceso a datos vía Prisma.

## Por qué tres apps separadas y no una

`frontend` (catálogo público, SEO, checkout) y `backoffice` (panel interno, requiere login) tienen audiencias, requisitos de SEO y ciclos de deploy distintos. Separarlas evita que un cambio en el admin fuerce un rebuild/redeploy de la tienda pública, y permite que el admin tenga reglas de acceso distintas (pensado para vivir en un subdominio o dominio propio, no indexado).

## Autenticación entre apps

- `backend` emite un JWT en `/api/auth/login`. Tanto `frontend` como `backoffice` lo guardan del lado del cliente y lo mandan en `Authorization: Bearer <token>`.
- No hay sesión compartida entre `frontend` y `backoffice`: loguearse en uno no autentica al otro.
- `backend` valida el rol (`ADMIN`/`CUSTOMER`) en cada request con guards — el frontend/backoffice no deciden qué está permitido, solo ocultan UI. La autorización real vive siempre en el backend.

## Deuda de arquitectura conocida

- **Frontend y backoffice duplican tipos y lógica de fetching.** Si algún día se vuelve doloroso, la salida natural es un paquete compartido (`@homepadel/types`, `@homepadel/api-client`) publicado localmente o como workspace — pero eso implica migrar a pnpm workspaces, que hoy no está hecho (ver decisión en README/histórico de conversación).
- **`apps/backend/prisma/seed_channels.sql` sigue siendo necesario**: son los `ContactChannel` reales que `seed.ts` no siembra. El resto de scripts sueltos que había ahí (debug, schema viejo, seed duplicado) se limpiaron — ver [backend.md](backend.md).
- **`apps/backend/tsconfig.json` tiene `strictNullChecks: false` y `noImplicitAny: false`** (default de scaffold de NestJS, nunca ajustado). El compilador no protege contra `null`/`undefined` no manejados en ese proyecto.
