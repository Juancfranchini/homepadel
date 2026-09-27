# Frontend (tienda pública)

Next.js 15, App Router. `apps/frontend/src/`:

```
app/            → rutas (carrito, catalogo, checkout, contacto, cuenta, envios, faq,
                  medios-de-pago, politica-de-devolucion, privacidad, producto,
                  rastrear, talles, terminos)
components/     → account/ cart/ contacto/ home/ layout/ pages/ ui/
hooks/          → useBranding, usePaymentMethods
lib/            → api.ts (cliente Axios), metaPixel.ts, tema.ts (claro/oscuro), utils.ts
store/          → authStore.ts, cartStore.ts (Zustand)
types/
```

## Estado

Zustand para estado global de cliente (`authStore`, `cartStore`) — no Redux, no Context API para esto. Estado de servidor (catálogo, pedidos) se pide directo con Axios contra `NEXT_PUBLIC_API_URL`, sin capa de cache tipo React Query.

Excepción: las páginas que tienen que llegar completas a buscadores y vistas previas (`/catalogo`, `/producto/[slug]`) traen sus datos desde el servidor con `getDesdeServidor` (`src/lib/serverApi.ts`, `fetch` con `revalidate`) y se los pasan al componente de cliente. En el catálogo, los filtros cambian la URL y el servidor vuelve a armar el listado; la ficha arranca con el producto del servidor y lo vuelve a pedir sin caché desde el navegador.

## Formularios

`react-hook-form` + `zod` (`@hookform/resolvers`) en todo formulario con input de usuario (checkout, contacto, cuenta). El schema de Zod es la validación del lado del cliente — **no reemplaza la validación del DTO en el backend**, es UX (feedback inmediato), no seguridad.

## Estilos

TailwindCSS 3. Sin librería de componentes (no hay `packages/ui` — cada componente en `components/ui/` es local a esta app y no se comparte con `backoffice`).

### Tema claro / oscuro

La tienda tiene dos temas. El oscuro es el de siempre y el que ve quien entra por primera vez; el claro se elige con el botón de luna/sol del header (`components/layout/ThemeToggle.tsx`) y el navegador lo recuerda (`localStorage`, clave `hp-tema`). El tema vive en `data-theme` de `<html>`; un script chico en el `<head>` (`lib/tema.ts`) lo aplica antes de pintar, para que no haya destello.

**Los colores no se escriben en hex: se usan por nombre.** Cada nombre está definido para los dos temas en `src/app/globals.css` (variables `--c-*`) y registrado en `tailwind.config.ts`:

| Nombre | Para qué | Oscuro | Claro |
|---|---|---|---|
| `page` | fondo de página | `#050606` | `#F5F5F0` |
| `panel` / `card` | paneles, modales, tarjetas | `#0C0C0C` / `#0F1111` | blanco |
| `field` | inputs | `#161818` | `#F4F4EF` |
| `chip` | chips, bordes marcados, íconos apagados | `#1A1F21` | `#E6E6DF` |
| `line` | bordes sutiles | `#0D0F0F` | `#E7E7E1` |
| `night`, `ocean`, `ocean-2`, `olive` | fondos de secciones de la home | azules / oliva | tintes claros |
| `fg` / `fg-soft` / `fg-muted` | texto principal / secundario / apagado | `#F7F6F7` / `#C7C7C0` / `#8A8A85` | `#15171A` / `#43443E` / `#66675E` |
| `brand-fg` | el lima de marca **como texto o ícono** | `#B7D31A` | `#5C6E00` |

Se usan con cualquier propiedad y con opacidad: `bg-page`, `text-fg-muted`, `border-line`, `bg-fg/5`.

- El lima `#B7D31A` de botones, bordes y rellenos **no cambia** entre temas y se sigue escribiendo como hex; como texto sobre claro no se lee (1,6:1), por eso existe `brand-fg`. Lo mismo el texto `#050606` sobre botones lima.
- Para un color que no tiene nombre (se usa una o dos veces) o para ajustar algo solo en el claro, está la variante `light:` — por ejemplo `bg-[#101416] light:bg-[#EFF2EC]` o `text-green-400 light:text-green-700` (los colores de estado `-300`/`-400` están pensados para fondo oscuro).
- Texto sobre fotos con velo negro (tarjetas de categoría, botones sobre la imagen de un producto): va claro en los dos temas, con el hex fijo, no con `fg`.
- Al agregar un color nuevo que se vaya a repetir: sumarlo en `globals.css` (los dos temas) y en `tailwind.config.ts`, y chequear contraste en el claro.

## URLs viejas de Tiendanube

La tienda vivía en Tiendanube y Google todavía tiene indexadas sus URLs. `src/middleware.ts` las redirige con 308 (permanente), y **solo** corre para esas rutas (ver su `matcher`):

| URL vieja | Destino |
|---|---|
| `/productos/<handle>/` | `/producto/<slug>` si el handle (sin el sufijo aleatorio tipo `-9l2i6`) coincide exacto con un único producto; si no, `/catalogo?q=<palabras>` |
| `/productos/` | `/catalogo` |
| `/<categoria>/` | `/catalogo?categoria=<categoria>` |
| `/<categoria>/<marca>/` | `/catalogo?categoria=<categoria>&marca=<marca>` si la marca tiene productos en esa categoría; si no, sin marca |

La lógica está en `lib/legacyUrls.ts` (pura, con tests en `lib/legacyUrls.test.ts` — correr con `npm test`). Si aparece otra categoría vieja de Tiendanube dando 404, sumarla en `LEGACY_CATEGORY_SLUGS` **y** en el `matcher` del middleware.

## SEO y datos para compartir

Los metadatos de Next se **heredan** del layout raíz a todas las rutas, y el objeto `openGraph` se reemplaza entero (no se combina). Por eso el layout raíz (`app/layout.tsx`) lleva solo lo común:

- **Sin `alternates.canonical`, a propósito.** Un canonical `/` ahí hacía que `/terminos`, `/privacidad`, etc. le dijeran a Google que eran duplicados de la portada. No volver a agregarlo.
- `openGraph` con solo tipo, idioma y nombre del sitio (`OPEN_GRAPH_BASE` en `lib/seoPortada.ts`). Sin título ni URL: así cada página se comparte con su propio `<title>`.
- La imagen para compartir la genera `app/opengraph-image.tsx` (logo sobre el fondo de la marca). La ficha de producto usa la foto del producto.

Reglas al sumar una página:

- **Indexable:** declarar su `alternates.canonical`. Si la página es `'use client'`, en un `layout.tsx` de su carpeta (ver `terminos/layout.tsx`).
- **Privada** (cuenta, carrito, checkout, links de venta): `robots: { index: false, follow: false }` en su layout. `/venta` no está en el `disallow` de `robots.ts` a propósito: si Google no puede leerla, tampoco ve el noindex.
- Si define su propio `openGraph`, empezar por `...OPEN_GRAPH_BASE` (ver la portada y la ficha de producto).

## Reglas

- Todo fetch al backend pasa por `lib/api.ts`, no se instancia Axios suelto en un componente.
- Nada de credenciales ni tokens de terceros (Mercado Pago, Cloudinary) en este código: eso vive en el backend. El frontend solo consume `NEXT_PUBLIC_API_URL`.
- Componentes de servidor por defecto (App Router); `"use client"` solo donde hay estado, efectos o handlers de evento — ver [componentes.md](componentes.md).
