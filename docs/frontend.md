# Frontend (tienda pública)

Next.js 15, App Router. `apps/frontend/src/`:

```
app/            → rutas (carrito, catalogo, checkout, contacto, cuenta, envios, faq,
                  medios-de-pago, politica-de-devolucion, privacidad, producto,
                  rastrear, talles, terminos)
components/     → account/ cart/ contacto/ home/ layout/ pages/ ui/
hooks/          → useBranding, usePaymentMethods
lib/            → api.ts (cliente Axios), metaPixel.ts, utils.ts
store/          → authStore.ts, cartStore.ts (Zustand)
types/
```

## Estado

Zustand para estado global de cliente (`authStore`, `cartStore`) — no Redux, no Context API para esto. Estado de servidor (catálogo, pedidos) se pide directo con Axios contra `NEXT_PUBLIC_API_URL`, sin capa de cache tipo React Query.

## Formularios

`react-hook-form` + `zod` (`@hookform/resolvers`) en todo formulario con input de usuario (checkout, contacto, cuenta). El schema de Zod es la validación del lado del cliente — **no reemplaza la validación del DTO en el backend**, es UX (feedback inmediato), no seguridad.

## Estilos

TailwindCSS 3. Sin sistema de tokens de diseño propio ni librería de componentes (no hay `packages/ui` — cada componente en `components/ui/` es local a esta app y no se comparte con `backoffice`).

## URLs viejas de Tiendanube

La tienda vivía en Tiendanube y Google todavía tiene indexadas sus URLs. `src/middleware.ts` las redirige con 308 (permanente), y **solo** corre para esas rutas (ver su `matcher`):

| URL vieja | Destino |
|---|---|
| `/productos/<handle>/` | `/producto/<slug>` si el handle (sin el sufijo aleatorio tipo `-9l2i6`) coincide exacto con un único producto; si no, `/catalogo?q=<palabras>` |
| `/productos/` | `/catalogo` |
| `/<categoria>/` | `/catalogo?categoria=<categoria>` |
| `/<categoria>/<marca>/` | `/catalogo?categoria=<categoria>&marca=<marca>` si la marca tiene productos en esa categoría; si no, sin marca |

La lógica está en `lib/legacyUrls.ts` (pura, con tests en `lib/legacyUrls.test.ts` — correr con `npm test`). Si aparece otra categoría vieja de Tiendanube dando 404, sumarla en `LEGACY_CATEGORY_SLUGS` **y** en el `matcher` del middleware.

## Reglas

- Todo fetch al backend pasa por `lib/api.ts`, no se instancia Axios suelto en un componente.
- Nada de credenciales ni tokens de terceros (Mercado Pago, Cloudinary) en este código: eso vive en el backend. El frontend solo consume `NEXT_PUBLIC_API_URL`.
- Componentes de servidor por defecto (App Router); `"use client"` solo donde hay estado, efectos o handlers de evento — ver [componentes.md](componentes.md).
