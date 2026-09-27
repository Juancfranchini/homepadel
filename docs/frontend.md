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

Excepción: las páginas que tienen que llegar completas a buscadores y vistas previas (`/catalogo`, `/producto/[slug]`) traen sus datos desde el servidor con `getDesdeServidor` (`src/lib/serverApi.ts`, `fetch` con `revalidate`) y se los pasan al componente de cliente. En el catálogo, los filtros cambian la URL y el servidor vuelve a armar el listado; la ficha arranca con el producto del servidor y lo vuelve a pedir sin caché desde el navegador.

## Formularios

`react-hook-form` + `zod` (`@hookform/resolvers`) en todo formulario con input de usuario (checkout, contacto, cuenta). El schema de Zod es la validación del lado del cliente — **no reemplaza la validación del DTO en el backend**, es UX (feedback inmediato), no seguridad.

## Estilos

TailwindCSS 3. Sin sistema de tokens de diseño propio ni librería de componentes (no hay `packages/ui` — cada componente en `components/ui/` es local a esta app y no se comparte con `backoffice`).

## Reglas

- Todo fetch al backend pasa por `lib/api.ts`, no se instancia Axios suelto en un componente.
- Nada de credenciales ni tokens de terceros (Mercado Pago, Cloudinary) en este código: eso vive en el backend. El frontend solo consume `NEXT_PUBLIC_API_URL`.
- Componentes de servidor por defecto (App Router); `"use client"` solo donde hay estado, efectos o handlers de evento — ver [componentes.md](componentes.md).
