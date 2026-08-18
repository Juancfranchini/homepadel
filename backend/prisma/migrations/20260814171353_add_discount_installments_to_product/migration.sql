-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "discountPercentage" DOUBLE PRECISION,
ADD COLUMN     "hasInstallmentsInterest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "installments" INTEGER,
ADD COLUMN     "installmentsInterest" DOUBLE PRECISION;
