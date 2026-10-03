-- Tope de descuento en pesos para cupones de porcentaje: un 20% sin tope en
-- una compra de varias paletas puede regalar mucho más de lo pensado.
-- Opcional: los cupones existentes quedan sin tope, como hasta ahora.
ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "maxDiscount" DOUBLE PRECISION;
