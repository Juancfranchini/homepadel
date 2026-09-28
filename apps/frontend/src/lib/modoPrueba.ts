/**
 * Modo prueba del navegador: para que la tienda pueda recorrerse a sí misma
 * sin ensuciar sus números.
 *
 * Se activa entrando una vez con `?modo_prueba=1` (queda guardado en este
 * navegador) y se apaga con `?modo_prueba=0` o desde el aviso en pantalla.
 * Mientras está activo, no se instala el Pixel de Meta y ningún evento sale
 * de acá: ni a Meta ni al embudo del backoffice.
 *
 * Las compras de prueba se reconocen en el servidor por el mail (lista de
 * cuentas de prueba del backoffice), no por esto: un navegador no puede
 * decidir qué venta es real.
 */

const CLAVE = 'hp_modo_prueba';

export function modoPruebaActivo(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const pedido = new URLSearchParams(window.location.search).get('modo_prueba');
    if (pedido === '1') localStorage.setItem(CLAVE, '1');
    if (pedido === '0') localStorage.removeItem(CLAVE);
    return localStorage.getItem(CLAVE) === '1';
  } catch {
    // Sin acceso al almacenamiento (navegación privada estricta): modo normal.
    return false;
  }
}

export function salirDeModoPrueba(): void {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    // Nada que borrar.
  }
}
