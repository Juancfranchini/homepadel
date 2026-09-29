-- El selector de unidad de peso del backoffice ofrecía "mg" como primera
-- opción: al no tocarlo, el peso quedaba en miligramos y la tienda mostraba,
-- por ejemplo, "360 mg" en una paleta. Ningún producto de la tienda se pesa en
-- miligramos: se pasan a gramos. Se puede correr más de una vez.
UPDATE "Product" SET "weightUnit" = 'g' WHERE "weightUnit" = 'mg';
UPDATE "ProductVariant" SET "weightUnit" = 'g' WHERE "weightUnit" = 'mg';
