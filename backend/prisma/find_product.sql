SELECT c.id as category_id, c.name as category_name, p.id as product_id, p.name as product_name 
FROM "Category" c 
JOIN "Product" p ON p."categoryId" = c.id 
WHERE p.name ILIKE '%bolso%' OR p.name ILIKE '%palas%'
LIMIT 5;
