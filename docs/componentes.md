# Buenas prácticas de componentes (frontend / backoffice)

Aplica a `apps/frontend/src/components` y `apps/backoffice/src/components`. Ambas apps usan Next.js 15 App Router + React 19, pero no comparten código — estas reglas son las mismas en las dos, aplicadas por separado.

## Server vs Client

Server Component por defecto. `"use client"` solo cuando el componente necesita:

- estado (`useState`, `useReducer`)
- efectos (`useEffect`)
- handlers de evento del navegador (`onClick`, `onChange`, ...)
- una librería que en sí misma requiere browser (Zustand store, TanStack Table, TipTap)

Si solo una parte del árbol necesita interactividad, aislarla en un componente chico con `"use client"` propio en vez de marcar todo el árbol como cliente. Un `"use client"` en la página completa cuando solo un botón necesita `onClick` es el error más común a evitar.

## Tamaño y responsabilidad

Mismo límite que el resto del código: **≤ 80 líneas por componente, ≤ 400 líneas por archivo** (ver [convenciones-codigo.md](convenciones-codigo.md)).

```tsx
// MAL — un componente de 300+ líneas con toda la lógica de un formulario
// de producto: estado de cada campo, validación, submit, preview de imagen
export function ProductForm() { /* ... */ }

// BIEN — orquestador delgado, estado en un hook, ramas en subcomponentes
export function ProductForm() {
  const form = useProductForm();
  return (
    <form onSubmit={form.handleSubmit}>
      <ProductBasicFields form={form} />
      <ProductPricingFields form={form} />
      <ProductImagesField form={form} />
    </form>
  );
}
```

- Lógica de estado/efectos que no es puramente de presentación → hook propio (`use<Nombre>.ts`), no adentro del componente.
- Una rama condicional grande dentro de JSX (`if`/`switch` que decide qué renderizar) → un componente por rama, no todo anidado en el mismo return.
- Un menú, modal o tabla que se repite en dos pantallas de la misma app → extraer a `components/ui/` de esa app (no crear una copia con un prop distinto).

## Formularios

`react-hook-form` + `zod` (`@hookform/resolvers/zod`) para todo formulario con validación, sin excepción. No manejar formularios con `useState` suelto por campo — no escala y es donde se pierden validaciones.

## Props

- Tipar props con `interface Props` (o `type Props =`) explícito, nunca `any` ni props sin tipo.
- Evitar props booleanas que cambian el comportamiento del componente por completo (`isEdit`, `isCompact`, `variant`, etc. sin límite) — si un componente tiene 4+ flags booleanas cambiando su render, probablemente son dos componentes.

## Data fetching

- Todo fetch pasa por `lib/api.ts` de esa app (cliente Axios centralizado) — no instanciar `axios` ni usar `fetch` suelto dentro de un componente.
- Server Components pueden hacer fetch directo en el `page.tsx`/`layout.tsx`; Client Components lo hacen en un hook, no en el cuerpo del componente en cada render.

## Accesibilidad mínima

- Todo `<img>` con `alt` (vacío `alt=""` si es puramente decorativo, nunca ausente).
- Elementos interactivos son `<button>`/`<a>`, no un `<div onClick>`.
- Inputs de formulario con `<label>` asociado (o `aria-label` si el label visual no aplica).
