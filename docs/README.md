# Documentación

| Documento | Contenido |
|---|---|
| [arquitectura.md](arquitectura.md) | Cómo se relacionan las tres apps, flujo de datos, decisiones de infraestructura |
| [backend.md](backend.md) | Módulos NestJS, modelo de datos (Prisma), auth, integraciones externas |
| [frontend.md](frontend.md) | Estructura de la tienda pública, estado, data fetching |
| [backoffice.md](backoffice.md) | Estructura del panel admin, tablas, editor de contenido |
| [convenciones-codigo.md](convenciones-codigo.md) | Naming, tamaño de archivos/funciones, validación, manejo de errores, linters |
| [componentes.md](componentes.md) | Buenas prácticas de componentes React (frontend y backoffice) |
| [seguridad.md](seguridad.md) | Auth, guards, rate limiting, manejo de secretos, checklist antes de exponer un endpoint |
| [deploy.md](deploy.md) | Railway (backend), Vercel (frontend/backoffice), variables por entorno |
| [guia-maestra-setup-proyectos.md](guia-maestra-setup-proyectos.md) | Checklist genérico de bases (estructura, linters, docs, cursor rules, limpieza) — plantilla para arrancar cualquier proyecto nuevo, no específico de Home Pádel |

## Jerarquía de fuentes

1. Este `docs/`, para arquitectura y convenciones.
2. `.cursor/rules/*.mdc` y `CLAUDE.md` en la raíz — mismas reglas, formato para agentes.
3. Swagger (`/api/docs` del backend corriendo) para el contrato de API real, no lo que diga un doc viejo.
4. `README.md` de la raíz para el quickstart de instalación.

Si un doc contradice al código, gana el código — y se corrige el doc.
