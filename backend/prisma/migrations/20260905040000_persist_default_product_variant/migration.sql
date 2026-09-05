ALTER TABLE "ProductVariant" ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT false;

DO $$
DECLARE
  product_record RECORD;
BEGIN
  FOR product_record IN SELECT * FROM "Product" LOOP
    INSERT INTO "ProductVariant" (
      "id", "productId", "sku", "size", "color",
      "dimensionLength", "dimensionWidth", "dimensionHeight", "dimensionUnit",
      "weight", "weightUnit", "imageUrl", "images", "stock", "active", "isDefault",
      "createdAt", "updatedAt"
    )
    VALUES (
      product_record."id" || '-base',
      product_record."id",
      product_record."sku",
      COALESCE(product_record."size", ''),
      product_record."color",
      product_record."dimensionLength",
      product_record."dimensionWidth",
      product_record."dimensionHeight",
      product_record."dimensionUnit",
      product_record."weight",
      product_record."weightUnit",
      CASE WHEN cardinality(product_record."images") > 0 THEN product_record."images"[1] ELSE NULL END,
      CASE WHEN cardinality(product_record."images") > 1 THEN product_record."images"[2:array_length(product_record."images", 1)] ELSE ARRAY[]::TEXT[] END,
      product_record."stock",
      product_record."active",
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT ("id") DO UPDATE SET
      "sku" = EXCLUDED."sku",
      "size" = EXCLUDED."size",
      "color" = EXCLUDED."color",
      "dimensionLength" = EXCLUDED."dimensionLength",
      "dimensionWidth" = EXCLUDED."dimensionWidth",
      "dimensionHeight" = EXCLUDED."dimensionHeight",
      "dimensionUnit" = EXCLUDED."dimensionUnit",
      "weight" = EXCLUDED."weight",
      "weightUnit" = EXCLUDED."weightUnit",
      "imageUrl" = EXCLUDED."imageUrl",
      "images" = EXCLUDED."images",
      "stock" = EXCLUDED."stock",
      "active" = EXCLUDED."active",
      "isDefault" = true,
      "updatedAt" = NOW();
  END LOOP;
END $$;
