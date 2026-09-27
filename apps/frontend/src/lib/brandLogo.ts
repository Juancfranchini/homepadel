import { getImageUrl } from './utils';

/**
 * Logo de marca listo para el menú.
 *
 * Los logos originales pesan 200-360 KB y traen mucho margen negro alrededor.
 * Si están en Cloudinary, se piden recortados (`e_trim`) y achicados: quedan
 * en ~7 KB. Cualquier otra URL se usa tal cual.
 */
export function logoMarcaUrl(logo: string): string {
  const url = getImageUrl(logo);
  if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) return url;
  return url.replace('/image/upload/', '/image/upload/e_trim/c_fit,w_160,h_80/f_auto,q_auto/');
}
