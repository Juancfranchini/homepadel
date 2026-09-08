# BackOffice (panel admin)

Next.js 15, App Router, SPA de administración. `apps/backoffice/src/`:

```
app/
  (auth)/         → login, fuera del layout del dashboard
  (dashboard)/    → banners beneficios categorias clientes configuracion contacto
                     cupones faq hero marcas newsletter pedidos productos
                     productos-contenido promociones reviews testimonios
components/       → layout/ ui/
hooks/            → useDeleteEntity
lib/              → api.ts, delete-config.ts, utils.ts
types/
```

## Tablas

`@tanstack/react-table` (TanStack Table) para todo listado con orden/filtro/paginación — no reimplementar esa lógica a mano en un componente.

## Contenido rico

`@tiptap/*` (TipTap) para los campos de texto enriquecido de productos y secciones del sitio (`productos-contenido`, `configuracion`). Genera HTML que el backend guarda tal cual en `Json`/`String` — si se acepta HTML de un editor rico, el backend nunca debe confiar en que viene sanitizado sin revisarlo (ver `site-sections.sanitize.ts` como referencia de que sí se sanitiza en al menos un módulo).

## Borrado con validación de dependencias

`hooks/useDeleteEntity.ts` + `lib/delete-config.ts` centralizan el flujo de borrado, que en el backend pasa por `delete-validation` (bloquea borrar, por ejemplo, una categoría con productos activos). No armar un `fetch DELETE` suelto en un componente nuevo — usar este hook para que el error de "tiene dependencias" se muestre consistente.

## Gráficos

Recharts, solo en `configuracion`/dashboard de métricas.

## Reglas

- Todo lo que pega al backend pasa por `lib/api.ts`.
- Rutas de `(dashboard)` asumen usuario autenticado con rol ADMIN — la protección real es el guard del backend, esta app solo redirige si no hay token.
- Un módulo nuevo del backoffice (ej. nueva sección) debe seguir el mismo patrón de carpeta que los existentes: página con tabla (TanStack) + modal/form (react-hook-form + zod) + uso de `useDeleteEntity` si tiene borrado.
