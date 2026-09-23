-- Búsqueda que ignora tildes.
--
-- Postgres compara "padel" y "Pádel" como distintos, así que buscar sin tilde
-- —que es como escribe la mayoría— no encontraba la marca "Royal Pádel".
-- `unaccent` viene en contrib y no crea tablas ni índices: solo agrega la
-- función que normaliza el texto al comparar.
--
-- Si el usuario de la base no tiene permiso para crear extensiones, esta
-- migración falla y el despliegue se corta, así que va tolerada: el código
-- detecta que la función no existe y cae a la búsqueda con tildes.
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS unaccent;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'No se pudo crear la extensión unaccent: la búsqueda seguirá distinguiendo tildes.';
END
$$;
