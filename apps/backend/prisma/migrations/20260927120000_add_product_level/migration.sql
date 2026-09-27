-- Nivel de juego de la paleta: Principiante | Intermedio | Avanzado.
-- Opcional: los productos ya cargados no lo tienen, y fuera de las paletas
-- no aplica.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "level" TEXT;
