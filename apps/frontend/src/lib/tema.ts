// Tema claro / oscuro de la tienda. El valor vive en data-theme de <html>;
// los colores de cada tema están en globals.css.

export type Tema = 'dark' | 'light';

export const CLAVE_TEMA = 'hp-tema';

/**
 * Se ejecuta en el <head> antes de pintar: aplica el tema que la persona eligió
 * la última vez. Sin elección guardada queda el oscuro, que es el de la marca.
 */
export const SCRIPT_TEMA = `try{var t=localStorage.getItem('${CLAVE_TEMA}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export function temaActual(): Tema {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function aplicarTema(tema: Tema) {
  document.documentElement.dataset.theme = tema;
  try {
    localStorage.setItem(CLAVE_TEMA, tema);
  } catch {
    // Navegación privada o almacenamiento bloqueado: el cambio vale para esta visita.
  }
}
