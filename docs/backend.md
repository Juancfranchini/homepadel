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
- Envío Flex (moto en AMBA, Kiosco Lo de Juan, Tribulato 1149): `carrier: 'flex'` + la localidad del cliente (`city`). `calculateShipping(subtotal, 'flex', localidad)` ubica la localidad en una de 3 zonas (`src/shipping/envio-flex.ts`, con alias como "Capital Federal" → CABA) y cobra el precio de esa zona, sin envío gratis. Localidad fuera de zona o Flex apagado → 400. Precios y on/off en `shipping_rates.flex` (`activo`, `zona1..3`), editables en `/configuracion/tarifa-envio`; sin nada guardado rige el tarifario del kiosco (4.500 / 7.000 / 9.000). `GET /envio-flex` (público) devuelve zonas, localidades y precios para la tienda. La dirección del pedido arranca con "Envío Flex (zona N) —" para que quien despacha lo vea.
- Cupones: `CouponsService.validate(code, subtotal)` valida vigencia, usos y monto mínimo; `calculateDiscount` computa el monto. El uso (`usedCount`) se consume recién cuando la venta se concreta (orden directa creada, o pago de Mercado Pago aprobado en el webhook) — no al solo aplicar el cupón, mismo criterio que el stock. Antes el frontend tenía una lista fija de códigos (`VALID_COUPONS`) con 10% hardcodeado, visible en el bundle del navegador y sin conexión real al backend — corregido.
- Andreani: gratis (`carrier: 'andreani'`, costo 0) desde el mismo `freeShippingThreshold` que Correo Argentino; por debajo, `calculateShipping` responde 400 y la tienda lo coordina por WhatsApp (igual que OCA). La dirección del pedido arranca con "Andreani —".
- `OrdersService.create` y `PaymentsService.createPreference` recalculan envío y descuento de forma idéntica — `CreateOrderDto` ya **no acepta** `shipping`/`discount` del cliente, solo un `couponCode` opcional que el servidor valida.

## Mercado Pago: cuotas, reintentos y confirmación

- **Cuotas por monto** (`src/payments/cuotas.ts`, `site-sections` clave `cuotas`, editable en el backoffice → Configuración → Cuotas): `activo`, `cuotasBase` y `tramos` (`desde` en pesos + `cuotas`). Ejemplo: desde 300.000 → 9, desde 400.000 → 12. Se toma el tramo más alto alcanzado por productos − cupón (sin envío). Con `activo`, la preferencia lleva `payment_methods.installments` = ese número (tope de cuotas en Mercado Pago), y la tienda muestra el mismo número en fichas, carrito y checkout. **Que sean sin interés depende de los planes habilitados en la cuenta de Mercado Pago**: el sitio solo pone el tope. Apagado, rige el campo de cuotas de cada producto y Mercado Pago ofrece lo de la cuenta.
- **Cupón en la preferencia:** el descuento se reparte entre los ítems (`preference-items.ts`, al centavo); antes iba como un ítem con precio negativo, que Mercado Pago puede rechazar.
- **Reintentos sin duplicar** (`checkout-intento.ts`): la tienda manda un `checkoutId` por checkout (sessionStorage). Si vuelve con el mismo id y el mismo contenido (firma de ítems, precios, envío, cupón, comprador), se reusa el pedido pendiente y su preferencia (24 h); si cambió algo, pedido nuevo. Si ese pedido ya está pagado, 409 `yaPagado` y la tienda muestra el pedido en vez de cobrar de nuevo.
- **Confirmación:** el pedido pasa a pagado solo con el pago consultado a Mercado Pago (aviso firmado del webhook, o `/payments/confirm` al volver, que también consulta a Mercado Pago), nunca por la página de "gracias". El registro es idempotente por el id de pago (`pago-registrado.ts` compara el id exacto; antes coincidía como subcadena de otro número y un pago aprobado se daba por procesado). Si el webhook y la vuelta del comprador llegan a la vez, solo quien registra el pago manda Purchase.
- **Compra como invitado:** no hace falta cuenta. `POST /payments/create-preference` es público y `POST /orders` (transferencia) usa sesión opcional (`OptionalJwtAuthGuard`), con límite de 10 pedidos por minuto y el tope de 2 transferencias sin pagar por cuenta **o** por mail del pedido (`exigirTransferencia`). Al acreditarse un pago de Mercado Pago se crea (o se usa) la cuenta del mail del comprador, como antes.
- **Valor de Purchase:** productos − cupón + envío, en ARS (Mercado Pago: `transaction_amount`; transferencia: `order.total`). Los precios ya incluyen IVA: no se separan impuestos. `event_id` = `purchase_<número de pedido>`, con `order_id`, `content_ids` y `contents` de los productos. Un pago rechazado o pendiente no manda nada; la transferencia manda Purchase recién al marcarse pagada en el backoffice.
- **GA4:** no está instalado (no hay gtag ni GTM).

## Transferencia bancaria

- Doble llave: `ENABLE_BANK_TRANSFER=true` en el backend (Railway) **y** el switch de Transferencia prendido en el backoffice (`site-sections` / `payment_methods` → `transferencia.active`). Con cualquiera de los dos apagado, la tienda no la ofrece y `POST /orders` responde 400. La tienda no tiene variable propia: lee `transferencia.active` que calcula el backend (`src/payments/transferencia.ts`).
- Los datos de la cuenta (alias, CBU, titular, banco) **no** salen en `GET /site-sections/payment_methods` público (`mediosDePagoPublicos`): solo los ve el admin y el comprador, en la respuesta del pedido (`datosTransferencia`), para mostrarlos en la pantalla de pedido confirmado con el botón de mandar el comprobante por WhatsApp.
- Precio por transferencia: un pedido por transferencia cobra cada producto a su "Precio transferencia/depósito" del backoffice, si es menor que el precio vigente (`precioPorTransferencia` en `src/pricing/effective-price.ts`; `resolveItems(..., { porTransferencia: true })`). La tienda lo muestra con la misma regla, y solo si la transferencia está habilitada (`components/ui/PrecioTransferencia.tsx`). Antes se mostraba pero el pedido se cobraba al precio de lista.
- Un cliente puede tener como mucho 2 pedidos por transferencia pendientes de pago en 72 hs (`MAX_TRANSFERENCIAS_PENDIENTES`): el pedido descuenta stock al crearse, y sin tope alguien podría dejar productos bloqueados sin pagar.

## Bolsa de regalo

Opción sin cargo en el carrito y en el checkout (`components/cart/BolsaRegaloOption.tsx`, imagen en `public/images/bolsa-regalo.webp`). El navegador manda `bolsasRegalo` en `POST /orders` y en `POST /payments/create-preference`; el DTO acepta un entero de 0 a 50 y el servidor lo limita a las unidades compradas (`src/orders/bolsas-regalo.ts`). Se guarda en `notes.bolsasRegalo` y el backoffice lo muestra en Pedidos (ícono de regalo en la lista y aviso en el detalle).

## Meta: Pixel y API de Conversiones

Un evento se cuenta igual en el embudo del backoffice (Marketing) y en Meta. El que decide es el servidor:

- **Eventos del navegador** (PageView, ViewContent, AddToCart, InitiateCheckout, Contact): la tienda los manda a `POST /track` (`src/track/`). El servidor responde `{ registrado, pixel }`, y el Pixel del navegador sale solo con `pixel: true`, con el mismo `event_id` que la API de Conversiones para que Meta cuente uno solo.
- **Solo producción cuenta** (`src/common/meta/meta-destino.ts`): el origen del request (header `Origin`) tiene que ser `https://www.homepadel.com.ar` (`META_PRODUCTION_HOSTS`). Si no lo es (localhost, previews, homepadel.store), el evento no suma en el backoffice y a Meta va a "Eventos de prueba" si hay código (`META_TEST_EVENT_CODE` o el del backoffice); sin código no sale. En producción el código de prueba se ignora. `META_EVENTS_ENABLED=false` corta todo envío a Meta. En la tienda, el Pixel se instala solo en esos dominios (`NEXT_PUBLIC_META_PIXEL_HOSTS`).
- **Datos para reconocer a la persona:** email y teléfono (de la sesión o del checkout) cifrados con SHA-256, `external_id` (id de cuenta, cifrado), IP, user agent y las cookies `_fbp`/`_fbc`. Como el API vive en otro dominio, esas cookies las lee el navegador y las manda en el cuerpo. La tienda crea `_fbp` si todavía no existe (formato de Meta; el Pixel la adopta) y `_fbc` apenas llega alguien con `fbclid`, así los eventos por servidor nunca salen solo con IP y navegador (`lib/metaNavegador.ts`). Con sesión, el email también va al `init` del Pixel.
- **Código base del Pixel:** se usa el de Meta tal cual (`components/layout/MetaPixel.tsx`). Una versión reescrita a mano que no definía `window._fbq` hizo que el Pixel del navegador nunca mandara eventos desde este sitio.
- **Probar eventos en la tienda real:** se entra con `?meta_test=CODIGO` (el de Administrador de eventos → Probar eventos, que tiene que estar cargado en Configuración → Meta Pixel). Esa pestaña manda todo a "Probar eventos", sin Pixel ni embudo, y sus pedidos quedan `isTest` (fuera de las estadísticas). La compra, al pagarse, llega a "Probar eventos" con su valor. Se sale con `?meta_test=0` o desde el aviso en pantalla. Un código distinto al del backoffice no cambia nada.
- **Purchase sale solo del servidor**, cuando el pago se confirma: el aviso de Mercado Pago (o la consulta de la tienda al volver, que pregunta a Mercado Pago), o la transferencia marcada como pagada. Ver `src/payments/payments.meta.ts`. El pedido guarda al crearse `notes.metaCliente` (origen, IP, user agent, fbp, fbc), porque el aviso de Mercado Pago no trae nada del navegador. `/track` ya no acepta Purchase.
- **InitiateCheckout** sale al tocar "Finalizar compra" o al entrar directo a `/checkout`. Una vez por carrito en la visita (`lib/inicioCheckout.ts` en la tienda).
- **Pruebas:** lo que hace una cuenta de prueba (mail de la sesión o del checkout, lista en Configuración → Meta Pixel) no cuenta en ningún lado. Las órdenes y los carritos quedan con `isTest`, fuera de las estadísticas. El modo prueba del navegador (`?modo_prueba=1`) no manda nada.

## Mi cuenta: direcciones y favoritos

`src/cuenta/` (`/api/mi-cuenta`, siempre con JWT y sobre el usuario del token — no hay forma de tocar datos de otro):

- Direcciones (`UserAddress`): `GET/POST /direcciones`, `PATCH/DELETE /direcciones/:id`. Máximo 3 por cliente (`MAX_DIRECCIONES`, lo controla el servidor); una dirección ajena responde 404. El checkout las ofrece para completar el domicilio con un toque.
- Favoritos (`Favorite`, único por usuario+producto): `GET /favoritos` (productos activos con `effectivePrice`), `GET /favoritos/ids`, `PUT/DELETE /favoritos/:productId`, `POST /favoritos/sincronizar` (suma los marcados sin sesión al iniciarla). En la tienda los maneja `store/favoritosStore.ts`: sin sesión quedan en el navegador; `components/layout/FavoritosSync.tsx` los sube al iniciar sesión y los borra del navegador al cerrarla.

## Integraciones externas

| Servicio | Módulo | Notas |
|---|---|---|
| Mercado Pago | `payments` | Crea preferencias de pago; webhook (`POST /api/payments/webhook`) verifica firma con `MERCADOPAGO_WEBHOOK_SECRET` antes de marcar una orden como pagada |
| Cloudinary | `uploads` | Sube imágenes de producto/contenido; en dev sin `CLOUDINARY_URL` cae a disco local (`UPLOADS_DIR`), que no persiste entre deploys en Railway |
| Resend | `email` | Plantillas y campañas de email |
| Meta Conversions API | `track`, `payments` | Pixel ID y token en el backoffice (`site_sections` / `meta_pixel`). Ver "Meta: Pixel y API de Conversiones" |

## Deuda conocida (no corregir sin plan — ver CLAUDE.md)

- `tsconfig.json` con `strictNullChecks: false`, `noImplicitAny: false` — scaffold default de Nest, nunca endurecido.
- `prisma/seed_channels.sql` **se mantiene a propósito**: son los `ContactChannel` reales de producción (WhatsApp, Email, Instagram, Messenger) y `seed.ts` no los siembra. Hasta que se agregue ese seed a `seed.ts`, este archivo es la única fuente de esos datos — no borrarlo. El resto de `.sql`/`.txt`/`.tmp` sueltos que había en `prisma/` (queries de debug de una sola vez, un fragmento de schema viejo, un `seed.js` duplicado y muerto) se limpiaron.
- Cobertura de tests: `pricing.service.spec.ts` (incluye envío), `coupons.service.spec.ts`, `payments.signature.spec.ts`, `site-sections.sanitize.spec.ts` — 59 tests. Los otros ~23 módulos no tienen tests; en particular no hay un test de integración del flujo completo del webhook de Mercado Pago (decrementar stock + marcar orden PAID + consumir cupón), solo de la verificación de firma.
- `npm run lint` da **0 errores** y **168 warnings de `@typescript-eslint/no-explicit-any`**, regla en `warn` a propósito; ver `eslint.config.mjs`. Sin ningún `eslint-disable` en el código.
- Los 4 `catch {}` vacíos de `orders.service.ts` ahora loguean con `console.warn` en vez de tragar el error; `payments.service.ts` se partió en métodos privados (`settlePaidOrder`, `createFallbackPaidOrder`, `decrementStockForPaidOrder`, `createPendingOrder`, `buildPreferenceItems`, `incrementCouponUsage`) para entrar bajo el límite de 80 líneas después de sumarle envío y cupones. Los 2 `require()` de `payments.signature.spec.ts` quedaron permitidos a propósito solo en archivos `*.spec.ts` (config en `eslint.config.mjs`) — es el patrón correcto de `jest.isolateModules()`, no deuda.
