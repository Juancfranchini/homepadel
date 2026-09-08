# Backend (NestJS)

`apps/backend/src/<modulo>/` — cada módulo trae `*.module.ts`, `*.controller.ts`, `*.service.ts` y, si recibe input, `dto/*.dto.ts`.

## 27 módulos

Ver README para el listado agrupado por dominio (catálogo, pedidos y pagos, CMS, comunicación, administración). Fuente de verdad del contrato de cada endpoint: Swagger en `/api/docs` con el server corriendo, no este doc.

## Modelo de datos

`apps/backend/prisma/schema.prisma` — PostgreSQL vía Prisma. Modelos principales: `User`, `Category`, `Brand`, `Product` (con `ProductVariant` para talle/color), `Order`/`OrderItem`/`Shipment`, `Coupon`, `Promotion`, `ProductReview`, más una decena de modelos de contenido de la home (`Banner`, `HeroSlide`, `Benefit`, `Testimonial`, `FAQ`, `SiteSection`, `ContactChannel`) y de comunicación (`Newsletter`, `EmailTemplate`/`EmailCampaign`).

`SiteSection.data` y varios campos `Json?` de `Product` (`features`, `specs`, `highlights`, `compareData`...) guardan contenido semi-estructurado sin schema propio — flexible, pero sin validación de forma a nivel de Prisma. La validación de esos campos, si existe, vive en el DTO del endpoint que los escribe.

## Autenticación y autorización

- `auth` module: login/registro con Passport (`local` para login, `jwt` para requests autenticados). JWT firmado con `JWT_SECRET`, expira en `JWT_EXPIRES_IN` (7 días por defecto).
- `common/guards/jwt-auth.guard.ts` — exige JWT válido.
- `common/guards/optional-jwt-auth.guard.ts` — decodifica el JWT si viene, pero no rechaza si falta (para endpoints públicos que cambian de comportamiento si hay usuario logueado, ej. ver el propio pedido).
- `common/guards/roles.guard.ts` + `@Roles('ADMIN')` — autorización por rol. Todo lo que puede escribir/borrar catálogo o ver datos de otros usuarios debe llevar este guard, no confiar en que el frontend oculte el botón.

## Validación de entrada

`ValidationPipe` global (`main.ts`) con `whitelist: true` + `forbidNonWhitelisted: true` + `transform: true`. Efecto práctico: **cualquier campo que llega en el body y no está declarado en el DTO correspondiente hace que la request falle**, no se ignora en silencio. Todo endpoint que reciba body/query debe tener su DTO con decoradores de `class-validator` — no tipar como `any` ni leer `req.body` directo.

## Precio, envío y cupones — todo se calcula en el servidor

Regla dura del checkout: **nada de lo que manda el navegador determina cuánto se cobra.**

- Precio de cada ítem: `PricingService.resolveItems` — sale siempre de `Product`/`ProductVariant`, nunca del body de la request.
- Envío: `PricingService.calculateShipping(subtotal)` — lee `site-sections` clave `shipping_rates` (`flatRate`, `freeShippingThreshold`), configurable desde el backoffice (`/configuracion/tarifa-envio`). Antes el frontend tenía `4500`/`100000` hardcodeados en `carrito/page.tsx` y `checkout/page.tsx` y ese envío nunca llegaba a cobrarse — corregido.
- Cupones: `CouponsService.validate(code, subtotal)` valida vigencia, usos y monto mínimo; `calculateDiscount` computa el monto. El uso (`usedCount`) se consume recién cuando la venta se concreta (orden directa creada, o pago de Mercado Pago aprobado en el webhook) — no al solo aplicar el cupón, mismo criterio que el stock. Antes el frontend tenía una lista fija de códigos (`VALID_COUPONS`) con 10% hardcodeado, visible en el bundle del navegador y sin conexión real al backend — corregido.
- `OrdersService.create` y `PaymentsService.createPreference` recalculan envío y descuento de forma idéntica — `CreateOrderDto` ya **no acepta** `shipping`/`discount` del cliente, solo un `couponCode` opcional que el servidor valida.

## Integraciones externas

| Servicio | Módulo | Notas |
|---|---|---|
| Mercado Pago | `payments` | Crea preferencias de pago; webhook (`POST /api/payments/webhook`) verifica firma con `MERCADOPAGO_WEBHOOK_SECRET` antes de marcar una orden como pagada |
| Cloudinary | `uploads` | Sube imágenes de producto/contenido; en dev sin `CLOUDINARY_URL` cae a disco local (`UPLOADS_DIR`), que no persiste entre deploys en Railway |
| Resend | `email` | Plantillas y campañas de email |
| Meta Conversions API | `track` | Opcional (`META_ACCESS_TOKEN`), tracking de conversiones server-side |

## Deuda conocida (no corregir sin plan — ver CLAUDE.md)

- `tsconfig.json` con `strictNullChecks: false`, `noImplicitAny: false` — scaffold default de Nest, nunca endurecido.
- `prisma/seed_channels.sql` **se mantiene a propósito**: son los `ContactChannel` reales de producción (WhatsApp, Email, Instagram, Messenger) y `seed.ts` no los siembra. Hasta que se agregue ese seed a `seed.ts`, este archivo es la única fuente de esos datos — no borrarlo. El resto de `.sql`/`.txt`/`.tmp` sueltos que había en `prisma/` (queries de debug de una sola vez, un fragmento de schema viejo, un `seed.js` duplicado y muerto) se limpiaron.
- Cobertura de tests: `pricing.service.spec.ts` (incluye envío), `coupons.service.spec.ts`, `payments.signature.spec.ts`, `site-sections.sanitize.spec.ts` — 59 tests. Los otros ~23 módulos no tienen tests; en particular no hay un test de integración del flujo completo del webhook de Mercado Pago (decrementar stock + marcar orden PAID + consumir cupón), solo de la verificación de firma.
- `npm run lint` da **0 errores** y **168 warnings de `@typescript-eslint/no-explicit-any`**, regla en `warn` a propósito; ver `eslint.config.mjs`. Sin ningún `eslint-disable` en el código.
- Los 4 `catch {}` vacíos de `orders.service.ts` ahora loguean con `console.warn` en vez de tragar el error; `payments.service.ts` se partió en métodos privados (`settlePaidOrder`, `createFallbackPaidOrder`, `decrementStockForPaidOrder`, `createPendingOrder`, `buildPreferenceItems`, `incrementCouponUsage`) para entrar bajo el límite de 80 líneas después de sumarle envío y cupones. Los 2 `require()` de `payments.signature.spec.ts` quedaron permitidos a propósito solo en archivos `*.spec.ts` (config en `eslint.config.mjs`) — es el patrón correcto de `jest.isolateModules()`, no deuda.
