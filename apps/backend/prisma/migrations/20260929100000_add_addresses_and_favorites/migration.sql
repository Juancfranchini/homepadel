-- Direcciones guardadas del cliente (hasta 3, lo controla el servidor) y
-- favoritos (el corazón de los productos). Idempotente, como la migración
-- anterior: se puede volver a correr sin romper nada.

CREATE TABLE IF NOT EXISTS "UserAddress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserAddress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "UserAddress_userId_idx" ON "UserAddress"("userId");
CREATE INDEX IF NOT EXISTS "Favorite_userId_idx" ON "Favorite"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Favorite_userId_productId_key" ON "Favorite"("userId", "productId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserAddress_userId_fkey') THEN
    ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Favorite_userId_fkey') THEN
    ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Favorite_productId_fkey') THEN
    ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
