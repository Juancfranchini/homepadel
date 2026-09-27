-- Embudo de marketing propio, sin depender de entrar a Meta Business.
--
-- Sin datos personales: ni IP, ni cookies, ni email — solo qué pasó, sobre
-- qué producto (si corresponde) y cuándo. productName queda guardado tal
-- como se llamaba el producto en ese momento, para que el ranking no se
-- rompa si después se renombra o se borra.
CREATE TABLE IF NOT EXISTS "MarketingEvent" (
  "id"          TEXT NOT NULL,
  "eventName"   TEXT NOT NULL,
  "productId"   TEXT,
  "productName" TEXT,
  "value"       DOUBLE PRECISION,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MarketingEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "MarketingEvent_eventName_createdAt_idx" ON "MarketingEvent"("eventName", "createdAt");
CREATE INDEX IF NOT EXISTS "MarketingEvent_productId_idx" ON "MarketingEvent"("productId");
