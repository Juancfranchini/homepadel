-- HomePadel — Migración delta: nuevas tablas de secciones homepage + columnas adicionales
-- Esta migración asume que las tablas originales ya existen (creadas con db push en el deploy anterior).
-- Solo agrega lo nuevo, con IF NOT EXISTS para ser idempotente.

-- ─── Nuevas columnas en tablas existentes ──────────────────────────────────────

ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Brand" ADD COLUMN IF NOT EXISTS "url" TEXT;
ALTER TABLE "Brand" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isNew" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isOffer" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Promotion" ADD COLUMN IF NOT EXISTS "ctaText" TEXT;
ALTER TABLE "Promotion" ADD COLUMN IF NOT EXISTS "ctaUrl" TEXT;

ALTER TABLE "Banner" ADD COLUMN IF NOT EXISTS "imageMobile" TEXT;
ALTER TABLE "Banner" ADD COLUMN IF NOT EXISTS "ctaText" TEXT;

-- ─── Nuevas tablas ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "HeroSlide" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "image" TEXT,
    "imageMobile" TEXT,
    "ctaPrimary" TEXT,
    "ctaPrimaryUrl" TEXT,
    "ctaSecondary" TEXT,
    "ctaSecondaryUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Benefit" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Benefit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Testimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "photo" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SiteSection" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteSection_pkey" PRIMARY KEY ("id")
);

-- ─── Índices únicos para nuevas tablas ────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS "SiteSection_key_key" ON "SiteSection"("key");
