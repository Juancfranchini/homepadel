-- El PDV extiende pedidos, productos y usuarios existentes: no crea un libro
-- de ventas paralelo. Los defaults preservan todos los registros históricos.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'STAFF';

CREATE TYPE "SalesChannel" AS ENUM ('ONLINE', 'LOCAL', 'WHATSAPP', 'INSTAGRAM', 'SOCIAL', 'PHONE');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'CARD', 'DIGITAL_WALLET', 'EXTERNAL_TERMINAL', 'MERCADOPAGO');
CREATE TYPE "PaymentKind" AS ENUM ('CHARGE', 'REFUND');
CREATE TYPE "PaymentState" AS ENUM ('PENDING', 'CONFIRMED', 'VOIDED');
CREATE TYPE "InventoryStatus" AS ENUM ('NONE', 'DEDUCTED', 'RESTORED');
CREATE TYPE "InventoryMovementType" AS ENUM ('SALE', 'RETURN', 'CANCELLATION', 'ADJUSTMENT');
CREATE TYPE "CashSessionStatus" AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE "CashMovementType" AS ENUM ('OPENING', 'SALE', 'INCOME', 'WITHDRAWAL', 'REFUND', 'CLOSING_ADJUSTMENT');
CREATE TYPE "SavedCartStatus" AS ENUM ('SAVED', 'CONVERTED', 'CANCELLED');
CREATE TYPE "SalesLinkStatus" AS ENUM ('OPEN', 'CHECKOUT', 'CONVERTED', 'EXPIRED', 'CANCELLED');
CREATE TYPE "DiscountType" AS ENUM ('AMOUNT', 'PERCENTAGE');
CREATE TYPE "SaleReturnType" AS ENUM ('RETURN', 'EXCHANGE');

ALTER TABLE "User" ADD COLUMN "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Product" ADD COLUMN "barcode" TEXT;
ALTER TABLE "ProductVariant" ADD COLUMN "barcode" TEXT;

ALTER TABLE "Order"
  ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "inventoryStatus" "InventoryStatus" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "channel" "SalesChannel" NOT NULL DEFAULT 'ONLINE',
  ADD COLUMN "sellerId" TEXT,
  ADD COLUMN "createdById" TEXT,
  ADD COLUMN "updatedById" TEXT,
  ADD COLUMN "branchId" TEXT,
  ADD COLUMN "cashSessionId" TEXT,
  ADD COLUMN "source" TEXT,
  ADD COLUMN "soldAt" TIMESTAMP(3),
  ADD COLUMN "paidAt" TIMESTAMP(3),
  ADD COLUMN "cancelledAt" TIMESTAMP(3),
  ADD COLUMN "cancellationReason" TEXT;

-- Las órdenes online ya pagadas cuentan como ventas históricas. No se marca
-- inventario DEDUCTED porque no existen movimientos previos para reconstruirlo.
UPDATE "Order"
SET "paymentStatus" = 'PAID', "soldAt" = "createdAt", "paidAt" = "createdAt"
WHERE "status" IN ('PAID', 'SHIPPED', 'DELIVERED');

CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");
CREATE UNIQUE INDEX "ProductVariant_barcode_key" ON "ProductVariant"("barcode");
CREATE INDEX "Order_channel_soldAt_idx" ON "Order"("channel", "soldAt");
CREATE INDEX "Order_branchId_soldAt_idx" ON "Order"("branchId", "soldAt");
CREATE INDEX "Order_sellerId_soldAt_idx" ON "Order"("sellerId", "soldAt");
CREATE INDEX "Order_paymentStatus_createdAt_idx" ON "Order"("paymentStatus", "createdAt");

CREATE TABLE "Branch" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "address" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Branch_code_key" ON "Branch"("code");

CREATE TABLE "CashRegister" (
  "id" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CashRegister_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CashRegister_branchId_code_key" ON "CashRegister"("branchId", "code");

CREATE TABLE "CashSession" (
  "id" TEXT NOT NULL,
  "registerId" TEXT NOT NULL,
  "openedById" TEXT NOT NULL,
  "closedById" TEXT,
  "status" "CashSessionStatus" NOT NULL DEFAULT 'OPEN',
  "openingAmount" DOUBLE PRECISION NOT NULL,
  "expectedTotals" JSONB,
  "countedTotals" JSONB,
  "differences" JSONB,
  "notes" TEXT,
  "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closedAt" TIMESTAMP(3),
  CONSTRAINT "CashSession_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CashSession_registerId_status_idx" ON "CashSession"("registerId", "status");
CREATE INDEX "CashSession_openedAt_idx" ON "CashSession"("openedAt");

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "method" "PaymentMethod" NOT NULL,
  "kind" "PaymentKind" NOT NULL DEFAULT 'CHARGE',
  "status" "PaymentState" NOT NULL DEFAULT 'CONFIRMED',
  "amount" DOUBLE PRECISION NOT NULL,
  "reference" TEXT,
  "externalId" TEXT,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdById" TEXT,
  "cashSessionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Payment_externalId_key" ON "Payment"("externalId");
CREATE INDEX "Payment_orderId_status_idx" ON "Payment"("orderId", "status");
CREATE INDEX "Payment_method_receivedAt_idx" ON "Payment"("method", "receivedAt");

CREATE TABLE "InventoryMovement" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "variantId" TEXT,
  "orderId" TEXT,
  "branchId" TEXT,
  "userId" TEXT,
  "type" "InventoryMovementType" NOT NULL,
  "quantity" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "InventoryMovement_productId_createdAt_idx" ON "InventoryMovement"("productId", "createdAt");
CREATE INDEX "InventoryMovement_orderId_idx" ON "InventoryMovement"("orderId");

CREATE TABLE "CashMovement" (
  "id" TEXT NOT NULL,
  "cashSessionId" TEXT NOT NULL,
  "orderId" TEXT,
  "paymentId" TEXT,
  "userId" TEXT NOT NULL,
  "type" "CashMovementType" NOT NULL,
  "method" "PaymentMethod",
  "amount" DOUBLE PRECISION NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CashMovement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CashMovement_paymentId_key" ON "CashMovement"("paymentId");
CREATE INDEX "CashMovement_cashSessionId_createdAt_idx" ON "CashMovement"("cashSessionId", "createdAt");

CREATE TABLE "SavedCart" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" "SavedCartStatus" NOT NULL DEFAULT 'SAVED',
  "channel" "SalesChannel" NOT NULL,
  "branchId" TEXT,
  "userId" TEXT NOT NULL,
  "items" JSONB NOT NULL,
  "customer" JSONB,
  "discountType" "DiscountType",
  "discountValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "shipping" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "notes" TEXT,
  "convertedOrderId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SavedCart_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SavedCart_convertedOrderId_key" ON "SavedCart"("convertedOrderId");

CREATE TABLE "SalesCheckoutLink" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "channel" "SalesChannel" NOT NULL,
  "status" "SalesLinkStatus" NOT NULL DEFAULT 'OPEN',
  "items" JSONB NOT NULL,
  "branchId" TEXT,
  "sellerId" TEXT NOT NULL,
  "customer" JSONB,
  "notes" TEXT,
  "orderId" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalesCheckoutLink_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SalesCheckoutLink_token_key" ON "SalesCheckoutLink"("token");
CREATE UNIQUE INDEX "SalesCheckoutLink_orderId_key" ON "SalesCheckoutLink"("orderId");
CREATE INDEX "SalesCheckoutLink_status_expiresAt_idx" ON "SalesCheckoutLink"("status", "expiresAt");

CREATE TABLE "SaleReturn" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "type" "SaleReturnType" NOT NULL,
  "reason" TEXT NOT NULL,
  "refundAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SaleReturn_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SaleReturn_orderId_createdAt_idx" ON "SaleReturn"("orderId", "createdAt");

CREATE TABLE "SaleReturnItem" (
  "id" TEXT NOT NULL,
  "returnId" TEXT NOT NULL,
  "orderItemId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "restock" BOOLEAN NOT NULL DEFAULT true,
  "amount" DOUBLE PRECISION NOT NULL,
  CONSTRAINT "SaleReturnItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SaleReturnItem_orderItemId_idx" ON "SaleReturnItem"("orderItemId");

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "changes" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

ALTER TABLE "Order" ADD CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_cashSessionId_fkey" FOREIGN KEY ("cashSessionId") REFERENCES "CashSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CashRegister" ADD CONSTRAINT "CashRegister_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "CashRegister"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_cashSessionId_fkey" FOREIGN KEY ("cashSessionId") REFERENCES "CashSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_cashSessionId_fkey" FOREIGN KEY ("cashSessionId") REFERENCES "CashSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SavedCart" ADD CONSTRAINT "SavedCart_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SavedCart" ADD CONSTRAINT "SavedCart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SavedCart" ADD CONSTRAINT "SavedCart_convertedOrderId_fkey" FOREIGN KEY ("convertedOrderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SalesCheckoutLink" ADD CONSTRAINT "SalesCheckoutLink_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SalesCheckoutLink" ADD CONSTRAINT "SalesCheckoutLink_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesCheckoutLink" ADD CONSTRAINT "SalesCheckoutLink_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SaleReturn" ADD CONSTRAINT "SaleReturn_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SaleReturn" ADD CONSTRAINT "SaleReturn_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SaleReturnItem" ADD CONSTRAINT "SaleReturnItem_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "SaleReturn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SaleReturnItem" ADD CONSTRAINT "SaleReturnItem_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Una configuración utilizable desde el primer deploy; se puede ampliar desde
-- la API del PDV sin depender de datos seed de desarrollo.
INSERT INTO "Branch" ("id", "name", "code", "active", "createdAt", "updatedAt")
VALUES ('branch_principal', 'Sucursal principal', 'PRINCIPAL', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "CashRegister" ("id", "branchId", "name", "code", "active", "createdAt", "updatedAt")
VALUES ('register_principal', 'branch_principal', 'Caja principal', 'CAJA-1', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("branchId", "code") DO NOTHING;
