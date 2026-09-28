-- Compras y carritos de prueba: se hacen con un mail de la lista
-- `cuentas_prueba` (site_sections) y no suman en las estadísticas ni se
-- informan a Meta. Lo ya cargado queda como real: marcar lo viejo es una
-- decisión aparte, no de la migración.
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "isTest" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AbandonedCart" ADD COLUMN IF NOT EXISTS "isTest" BOOLEAN NOT NULL DEFAULT false;
