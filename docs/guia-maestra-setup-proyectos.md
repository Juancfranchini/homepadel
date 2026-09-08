# Guía maestra — bases de un proyecto nuevo

Checklist de arranque para cualquier proyecto nuevo (o para poner en orden uno existente). Pensada para copiarse tal cual a otro repo el día 0, no específica de Home Pádel — donde haya un ejemplo concreto, es ilustración, no la regla.

Aplicada por primera vez en este repo en dos pasadas: alta de docs/linters/cursor rules, y después reordenamiento de carpetas + limpieza. El orden de las secciones de abajo es el orden recomendado para un proyecto nuevo (que es distinto al orden en que se hizo acá, porque acá ya existía código).

## 0. Antes de tocar nada: leer el proyecto

No armar documentación ni convenciones a ciegas. Primero entender qué hay:

- Inventariar apps/servicios reales (no confiar en el README viejo — leer `package.json` de cada uno, correr el árbol de carpetas).
- Grep de variables de entorno usadas (`process.env.` / `import.meta.env.`) contra lo que documentan los `.env.example` — casi siempre están desincronizados.
- Revisar qué linters/tests ya existen antes de asumir que no hay nada.
- Si hay un modelo de datos (Prisma/Drizzle/SQL), leerlo completo — ahí está el dominio real, no en la documentación vieja.

## 1. Estructura de carpetas

Monorepo con apps y paquetes compartidos, aunque el proyecto tenga una sola app hoy — cuesta poco dejarlo preparado:

```
proyecto/
├── apps/
│   ├── web/            (o frontend/, admin/, api/, etc.)
│   └── ...
├── packages/            → código compartido entre apps (tipos, UI, cliente de API)
│                           vacío está bien; documentar en packages/README.md por qué
├── docs/                 → ver sección 3
├── .cursor/rules/         → ver sección 5
├── CLAUDE.md              → ver sección 5
├── .editorconfig, .prettierrc.json, .prettierignore
└── docker-compose.yml (si aplica)
```

**Decisión importante y de alto impacto: ¿pnpm workspaces + turborepo (monorepo real, un solo lockfile) o apps independientes agrupadas en `apps/` (cada una con su propio `package.json`/lockfile, sin tooling de monorepo)?**

- Turborepo/pnpm real: mejor a largo plazo (cache de build, dependencias compartidas, un solo `npm install`), pero **rompe cualquier deploy existente** (Dockerfile, Railway/Vercel/lo que sea) y es mucho trabajo si ya hay apps corriendo en producción.
- Apps agrupadas en `apps/` sin tooling compartido: reordena la carpeta (mejor legibilidad, deja lugar para `packages/` a futuro) sin tocar cómo se instala/buildea/deploya cada app.

**Si el proyecto ya tiene algo corriendo en producción, preguntar al dueño del proyecto cuál de las dos quiere antes de mover una sola carpeta.** Es una decisión suya, no una default técnica — el motivo no es solo el riesgo, es que compromete tiempo/proceso de deploy que no es solo código. Si se elige mover carpetas, actualizar en el mismo paso: Dockerfile, configs de CI/deploy (Railway/Vercel/etc.), `.gitignore`, y todo path relativo en la documentación — un `grep` de las carpetas viejas sobre `README`/`docs`/`CLAUDE.md` antes de dar el paso por terminado.

## 2. Limpieza de archivos basura

Antes de documentar la estructura "final", sacar lo que no debería estar:

| Qué buscar | Qué hacer |
|---|---|
| Archivos de 0 bytes, `.tmp`, fragmentos de schema viejo | Borrar |
| Reportes/logs de un incidente puntual (`*-report.json`, capturas de debug) | Borrar (git conserva el historial si hace falta) |
| Scripts de debug de una sola vez (`test.sql`, `find_x.sql` sueltos sin estar en `migrations/`) | Borrar, salvo que — ver próxima fila |
| Un script suelto que resulta ser la única fuente de un dato real (ej. un seed que el seed "oficial" no cubre) | **No borrar.** Documentar por qué se mantiene y, si se puede, migrarlo al lugar correcto (ej. sumarlo al seed oficial) |
| Dos versiones del mismo script (`seed.js` y `seed.ts`, por ejemplo) | Confirmar cuál usa el flujo real (grep de scripts de `package.json` y del `Dockerfile`/CI) y borrar la que no se usa |
| Archivos de assets de prueba commiteados por accidente (`test-upload.png`, etc.) | Borrar |

Regla para no romper nada: **antes de borrar, grep del nombre del archivo contra todo el repo** (código, `package.json` scripts, Dockerfile, CI). Si no aparece en ningún lado más que en sí mismo, es seguro borrarlo.

## 3. Documentación (`docs/`)

Un `docs/README.md` como índice, más un doc por tema — ni todo en un README gigante, ni un doc por archivo de código:

- `arquitectura.md` — cómo se relacionan las apps/servicios, diagrama de flujo de datos, por qué están separados así, deuda de arquitectura conocida
- `<nombre-app>.md` por cada app/servicio — estructura de carpetas, qué librerías clave usa y para qué, deuda conocida específica de esa app
- `convenciones-codigo.md` — naming, límites de tamaño, validación obligatoria, manejo de errores, cómo correr el lint
- `componentes.md` (si hay frontend) — server vs client, tamaño, formularios, props, data fetching
- `seguridad.md` — auth, checklist antes de exponer un endpoint nuevo, manejo de secretos, gaps conocidos
- `deploy.md` — dónde vive cada app, variables de entorno por entorno, orden recomendado de deploy inicial, gaps de CI

Regla de esta guía: **todo lo que se documenta como "deuda conocida" debe ser algo que se vio de verdad en el código** (un archivo específico, una línea, un resultado de lint) — no una advertencia genérica tipo "podría haber bugs". Si no se puede señalar el archivo, no se documenta como deuda, se investiga primero.

## 4. Linters y formateo — configurarlos de verdad, no solo declararlos

Un `eslint-config-next` en `devDependencies` sin `eslint.config.mjs` no es un linter configurado, es una promesa. Por cada app:

1. ESLint flat config (`eslint.config.mjs`) + Prettier, con reglas mínimas no negociables:
   - `no-explicit-any` (empezar en `warn` si hay deuda existente grande — ver punto siguiente)
   - tamaño de archivo/función (`max-lines` 400, `max-lines-per-function` 80, ajustable según el proyecto)
   - prohibición real de `eslint-disable` (`eslint-plugin-eslint-comments`, regla `no-use`)
2. **Instalar de verdad y correr `npm run lint`.** El objetivo no es que dé limpio el primer día — es que muestre la deuda real en vez de esconderla.
3. Si una regla nueva genera cientos de errores en código legado (típicamente `no-explicit-any`), bajarla a `warn` **a propósito, con un comentario `TODO(deuda)` en el config** explicando cuántas instancias hay y cuándo subirla a `error`. No dejarla en `error` fingiendo que el lint pasa si en realidad nadie lo corre.
4. Documentar en `docs/<app>.md` el conteo real de errores/warnings al momento de configurar el lint — es la línea de base para medir progreso después.

## 5. Reglas para agentes/IA (`CLAUDE.md` + `.cursor/rules/`)

Mismo contenido, dos formatos (cada herramienta lee el suyo):

- `CLAUDE.md` en la raíz: resumen corto, con links a `docs/` para el detalle. No duplicar los docs completos acá.
- `.cursor/rules/*.mdc`: reglas separadas por tema (tamaño/DRY, validación/secretos, lo que aplique al proyecto — ej. "sin fetch a terceros desde el browser" si hay un backend que centraliza integraciones). Cada regla con `description` y `alwaysApply` en el frontmatter, ejemplos de MAL/BIEN cuando ayuda, y **siempre la razón, no solo la regla** — una regla sin motivo se rompe la primera vez que estorba.

## 6. Buenas prácticas de componentes/tipos/utils — auditoría, no solo la regla

Escribir la regla ("los tipos de dominio van en `types/`, las utilidades en `lib/utils.ts`, no adentro de un componente") no alcanza si el código existente ya la viola. Auditar de verdad:

1. Grep de `interface`/`type` declarados dentro de carpetas de componentes, filtrando los que son puramente `Props` (esos sí pueden quedarse locales — es idiomático en React).
2. De lo que queda, buscar cuáles son:
   - **Entidades de dominio** (coinciden con un modelo del backend: `Product`, `Review`, `Category`...) → mover a `types/`, y si ya existe una versión global, usar esa en vez de la local (duplicar un tipo que ya existe en otro lado es el bug más común de este patrón).
   - **Funciones utilitarias sin relación con el render** (formateo, resolución de URLs, cálculos) → mover a `lib/utils.ts`. Antes de mover, comprobar si ya existe una función que hace lo mismo (grep del nombre de la función y de un fragmento característico del cuerpo) — es común encontrar la misma lógica duplicada con un nombre distinto en dos componentes.
3. Después de cada movimiento: type-check (`npx tsc --noEmit`) antes de dar el cambio por terminado — mover un tipo usado en varios lados rompe silenciosamente si algún import queda apuntando al tipo local viejo.

## 7. Orden recomendado si se hace todo junto

1. Leer el proyecto (sección 0).
2. Confirmar con el dueño del proyecto el alcance de la reestructuración de carpetas (apps/ agrupadas vs. monorepo real) — es su decisión.
3. Mover carpetas primero (menos archivos tocados = menos conflictos con lo que sigue).
4. Limpiar basura (sección 2).
5. Documentación + `CLAUDE.md` + reglas de Cursor (secciones 3 y 5).
6. Linters configurados y corridos de verdad (sección 4), documentando la deuda real que muestran.
7. Auditoría de componentes/tipos/utils (sección 6) — al final, porque tocar código real conviene hacerlo sobre una estructura ya estable.

## Qué NO hacer en esta pasada

- No arreglar bugs de lógica que aparecen en el camino (un `catch` vacío, una función que hace algo raro) — **documentarlos como hallazgo**, no corregirlos mezclado con un cambio de estructura/tooling. Corregirlos es la fase siguiente, con su propio plan.
- No reformatear todo el código con Prettier en el mismo commit que configura Prettier — es un diff gigante que tapa los cambios reales. Ofrecerlo como paso aparte.
- No subir reglas de lint a `error` si van a dejar el build roto para todo el equipo desde el día siguiente — bajarlas a `warn` con el TODO es preferible a que nadie corra el lint porque siempre falla.
