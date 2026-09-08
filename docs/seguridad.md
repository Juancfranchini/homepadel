# Seguridad

## Auth

- JWT firmado con `JWT_SECRET`, expira en `JWT_EXPIRES_IN` (7 días). No hay revocación de sesión — invalidar todas las sesiones activas requiere rotar `JWT_SECRET`. Si en algún momento hace falta poder desloguear a un usuario puntual (cuenta comprometida, baja de admin), esto es una limitación real a resolver (sesión server-side sería la alternativa, no está implementada).
- Contraseñas con bcrypt (`BCRYPT_ROUNDS`, 10 por defecto).
- Roles: `ADMIN` / `CUSTOMER`. Todo endpoint de escritura de catálogo/pedidos/contenido debe llevar `@Roles('ADMIN')` + `RolesGuard` — nunca confiar en que el backoffice oculta el botón.

## Checklist antes de exponer un endpoint nuevo

1. ¿Tiene DTO con `class-validator` para todo el body/query que recibe?
2. ¿Necesita usuario logueado? → `JwtAuthGuard`. ¿Solo admin? → sumar `RolesGuard` + `@Roles('ADMIN')`.
3. ¿Devuelve datos de otro usuario? → filtrar por `userId` del token, no confiar en un `userId` que venga en el body/query.
4. ¿Escribe algo que después se renderiza como HTML en algún lado (frontend, email, backoffice)? → sanitizar antes de guardar (ver `site-sections.sanitize.ts` como referencia) o escapar al renderizar.
5. ¿Toca un servicio externo (Mercado Pago, Cloudinary, Resend)? → la credencial vive en variable de entorno del backend, nunca en el frontend/backoffice ni hardcodeada.

## Rate limiting

`@nestjs/throttler` global, 100 req/60s por IP. Los webhooks (Mercado Pago) y algunos endpoints públicos de alto tráfico pueden necesitar límites distintos si se detecta abuso — revisar caso por caso, no bajar el límite global.

## Webhook de Mercado Pago

`POST /api/payments/webhook` verifica la firma con `MERCADOPAGO_WEBHOOK_SECRET` antes de tocar una orden. **Nunca** quitar esa verificación para "debuggear más fácil" ni en desarrollo apuntando a producción — sin ella, cualquiera puede marcar una orden como pagada con un POST directo.

## Secretos

- Todo secreto (JWT, Mercado Pago, Cloudinary, Resend, DB) vive en variables de entorno, documentadas en el `.env.example` de cada app con qué pasa si falta.
- `.env`, `.env.local`, `.env.production` están en `.gitignore` — si alguno aparece en un `git status` para commitear, pausar y confirmar que no es sensible antes de agregarlo.
- Si un secreto llega a commitearse: revocarlo en el proveedor (Mercado Pago/Cloudinary/Resend/DB), no solo borrarlo del código — sigue en el historial de git.

## CORS

En producción, `backend` solo acepta origin de `FRONTEND_URL`, `BACKOFFICE_URL` y cualquier subdominio `*.vercel.app` (para previews). En dev acepta cualquier origin. Si se agrega un dominio de producción nuevo, sumarlo a las env vars — no ampliar el wildcard.

## Gap conocido

No hay un proceso de auditoría de dependencias (`npm audit`, Dependabot/Renovate) configurado en ninguna de las tres apps. Recomendado para el plan de correcciones "core" que sigue después de esta base de tooling.
