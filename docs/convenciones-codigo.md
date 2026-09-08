# Convenciones de código

Aplica a `apps/backend/`, `apps/frontend/` y `apps/backoffice/`. Reforzado por lint en las tres — ver sección Linters.

## Tamaño

| Qué | Límite |
|---|---|
| Archivo de lógica o componente | 400 líneas |
| Función / componente | 80 líneas |

Si un service de NestJS o un componente React se pasa de esto, es señal de que hace más de una cosa. Partir:

- Lógica de dominio repetida entre módulos → función compartida en `common/` (backend) o `lib/` (frontend/backoffice), **con test al lado si tiene alguna rama condicional**.
- Componente grande → orquestador delgado + subcomponentes + hook con la lógica de estado. Ver [componentes.md](componentes.md).
- Controller con muchas rutas → dividir por sub-recurso antes que amontonar métodos.

DRY es sobre *conocimiento de negocio*, no sobre líneas parecidas — dos validaciones que casualmente se ven iguales pero verifican cosas distintas no se deben forzar a compartir función.

## Prohibido

- `any` — si el tipo real es complicado, modelarlo (interface, DTO, Zod schema), no escaparlo.
- `eslint-disable` / `eslint-disable-next-line` / `eslint-disable-line` sin excepción.
- `@ts-ignore`. `@ts-expect-error` solo con comentario de una línea explicando por qué.
- Loguear o commitear secretos (tokens, claves, contraseñas). Si aparece uno en un diff, se revoca, no se rota en el mismo commit.
- Leer `req.body`/`req.query` sin pasar por un DTO validado (backend) o sin `zod.parse`/`safeParse` (frontend/backoffice).

## Validación de entrada — regla dura

**Todo input de usuario se valida en el backend, sin excepción**, aunque el frontend ya lo valide. El frontend valida para dar feedback rápido; el backend valida porque es el único límite de confianza real (cualquiera puede pegarle a la API con curl).

- Backend: DTO con decoradores de `class-validator` para cada endpoint que reciba body o query relevante. `ValidationPipe` global ya rechaza campos no declarados (`forbidNonWhitelisted`) — si un campo nuevo no aparece, revisar el DTO antes de asumir que es bug del pipe.
- Frontend/backoffice: schema de Zod + `react-hook-form` para cada formulario.

## Manejo de errores

- Backend: dejar que las excepciones de Nest (`BadRequestException`, `NotFoundException`, etc.) suban — no capturar y devolver `200` con un `{ error: ... }` en el body. `PrismaExceptionFilter` ya traduce errores de Prisma (unique constraint, FK) a HTTP apropiado; no hace falta un `try/catch` alrededor de cada `prisma.x.create`.
- Frontend/backoffice: nunca tragar un error de `catch` en silencio (`catch (e) {}`). Como mínimo, mostrar feedback al usuario o loguear con contexto de qué operación falló.

## Naming

- Inglés para identificadores de código (variables, funciones, campos de Prisma, nombres de archivo).
- Español para todo lo que ve el usuario (textos de UI, mensajes de error mostrados, slugs de producto/categoría).
- Un componente por archivo; nombre de archivo = nombre del componente/función principal que exporta.

## Linters

Configurados en las tres apps (ESLint flat config + Prettier). Correr antes de dar un cambio por terminado:

```bash
cd apps/backend    && npm run lint   # y npm run format:check
cd apps/frontend   && npm run lint
cd apps/backoffice && npm run lint
```

`npm run lint -- --fix` corrige lo automatizable (espaciado, imports, algunas reglas de estilo). Lo que el lint marca como error de tamaño/complejidad/`any` no se soluciona con `--fix`: se refactoriza.
