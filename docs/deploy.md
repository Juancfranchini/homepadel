# Deploy

## Importante — "Root Directory" en Railway y Vercel

Las tres apps se movieron de `backend/`/`frontend/`/`backoffice/` a `apps/backend/`/`apps/frontend/`/`apps/backoffice/`. Esa ruta se configura en el dashboard de cada servicio (Railway y Vercel), no vive en el repo — **hay que actualizarla a mano una vez** en cada uno o el próximo deploy va a fallar (no va a encontrar el `Dockerfile`/`package.json` en la ruta vieja).

## Backend → Railway

`apps/backend/railway.toml`: build con `apps/backend/Dockerfile`, healthcheck en `/api/docs`, reinicio ante fallo (hasta 3 reintentos). `start:prod` corre `prisma migrate deploy` antes de levantar el server — las migraciones pendientes se aplican solas en cada deploy.

Variables de entorno a configurar en Railway (ver `apps/backend/.env.example` para el detalle de cada una): `DATABASE_URL` (Railway la genera solo al agregar el servicio de Postgres), `JWT_SECRET`, `FRONTEND_URL`, `BACKEND_URL`, `BACKOFFICE_URL`, `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `CLOUDINARY_URL`, y opcionalmente `META_ACCESS_TOKEN`/`META_TEST_EVENT_CODE`.

Sin `CLOUDINARY_URL`, las imágenes subidas quedan en el disco del contenedor y **se pierden en cada redeploy** — no usar el fallback a disco local en producción.

## Frontend / BackOffice → Vercel

Ambas Next.js apps están preparadas para Vercel: el CORS del backend ya acepta cualquier `*.vercel.app` (incluye previews de PR). Cada una necesita, como mínimo:

- `NEXT_PUBLIC_API_URL` → URL del backend en Railway + `/api`
- `frontend` además: `NEXT_PUBLIC_SITE_URL` (para metadatos Open Graph/canonical)

## Orden recomendado al desplegar por primera vez

1. Backend en Railway con su Postgres — confirmar que `/api/docs` responde.
2. Cargar `FRONTEND_URL`/`BACKOFFICE_URL` en el backend con los dominios reales de Vercel (o corregirlos después del paso 3, si Vercel asigna la URL recién al crear el proyecto).
3. `frontend` y `backoffice` en Vercel, apuntando `NEXT_PUBLIC_API_URL` al backend ya desplegado.
4. Redeploy del backend si se corrigieron `FRONTEND_URL`/`BACKOFFICE_URL` en el paso 2.

## CI

`.github/workflows/ci.yml` corre en cada push/PR a `main`: typecheck + test para backend, typecheck + build para frontend y backoffice. El lint corre en las tres pero con `continue-on-error` — hay demasiada deuda de `max-lines-per-function` pre-existente como para que bloquee hoy (ver `docs/guia-maestra-setup-proyectos.md`, sección 4). El build de producción (`next build`, lo que corre Vercel) tiene el lint desacoplado (`eslint.ignoreDuringBuilds: true` en `next.config.ts`) por la misma razón — un deploy no debe fallar por deuda de lint ya conocida.

## Gap conocido

CI no bloquea todavía por lint (ver arriba). A medida que se reduzca la deuda de `max-lines-per-function`/`any`, conviene sacar el `continue-on-error` del job correspondiente.
