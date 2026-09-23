-- Género del producto: 'Hombre' | 'Mujer' | 'Unisex'.
--
-- Queda como texto opcional y no como enum, igual que `shape`: los productos
-- ya cargados no lo tienen y no todo el catálogo lo usa —una paleta puede no
-- tener género—. `IF NOT EXISTS` porque el esquema de producción se viene
-- sincronizando también con `prisma db push`, y la columna podría existir.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "gender" TEXT;
