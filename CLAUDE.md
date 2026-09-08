# Home Pádel

Ecommerce de productos de pádel. Tres apps independientes, sin workspace compartido — cada una tiene su propio `package.json` y `node_modules`.

```
homepadel/
├── apps/
│   ├── backend/     → API REST — NestJS 10 + Prisma 5 + PostgreSQL 16
│   ├── frontend/    → Tienda pública — Next.js 15 + React 19
│   └── backoffice/  → Panel admin — Next.js 15 + React 19
├── packages/        → vacío, reservado para código compartido futuro
└── docs/            → Documentación por tema (ver docs/README.md)
```

Detalle de stack, módulos, endpoints y setup: [README.md](README.md).
Convenciones de código, tamaño de archivos, validación: [docs/convenciones-codigo.md](docs/convenciones-codigo.md).
Buenas prácticas de componentes React: [docs/componentes.md](docs/componentes.md).
Reglas de Cursor equivalentes (para este agente también aplican): `.cursor/rules/*.mdc`.

## Reglas rápidas al tocar código

- Cada app se instala y corre por separado (`cd apps/backend && npm install`, etc.) — no hay `npm install` en la raíz.
- Todo input de usuario se valida: DTOs con `class-validator` en el backend (nunca confiar en lo que manda el front), Zod + `react-hook-form` en frontend/backoffice.
- Nada de `any`, `eslint-disable`, `@ts-ignore` sin justificar en una línea. Si el lint se queja, se arregla el código, no se silencia la regla.
- Límites de tamaño: archivo ≤ 400 líneas, función/componente ≤ 80 líneas. Si se pasa, se parte (ver [docs/convenciones-codigo.md](docs/convenciones-codigo.md)).
- Secretos y credenciales SIEMPRE por variable de entorno — nunca hardcodeados. Los `.env.example` de cada app documentan qué es obligatorio.
- Antes de dar por terminado un cambio: `npm run lint` en la app tocada (configurado en las tres — ver [docs/convenciones-codigo.md](docs/convenciones-codigo.md)).
- El backend tiene `tsconfig.json` con `strictNullChecks`/`noImplicitAny` en `false` (default de scaffold de Nest, nunca corregido). Es deuda conocida — no asumas que el compilador te va a salvar de un `null` ahí. Ver nota en docs/backend.md.
