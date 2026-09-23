-- Carritos abandonados: checkouts empezados que nunca terminaron en compra.
--
-- El email es único: cada persona tiene una sola fila, que se va actualizando
-- mientras arma el carrito. Si compra, la fila se marca como recuperada en
-- lugar de borrarse, para poder medir cuántos se rescataron.
CREATE TABLE IF NOT EXISTS "AbandonedCart" (
  "id"          TEXT NOT NULL,
  "email"       TEXT NOT NULL,
  "name"        TEXT,
  "phone"       TEXT,
  "items"       JSONB NOT NULL,
  "total"       DOUBLE PRECISION NOT NULL,
  "contactedAt" TIMESTAMP(3),
  "recoveredAt" TIMESTAMP(3),
  "orderNumber" TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AbandonedCart_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AbandonedCart_email_key" ON "AbandonedCart"("email");
CREATE INDEX IF NOT EXISTS "AbandonedCart_recoveredAt_updatedAt_idx" ON "AbandonedCart"("recoveredAt", "updatedAt");
