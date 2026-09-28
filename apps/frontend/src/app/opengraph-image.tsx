import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

/**
 * Imagen que muestran WhatsApp, Facebook, Instagram y X al compartir un link
 * de la tienda. El layout declaraba /og-image.jpg, un archivo que nunca
 * existió: todos los links salían sin imagen. Se genera una sola vez al
 * compilar, con el logo real sobre el fondo de la marca.
 *
 * La ficha de producto declara su propia imagen (la foto del producto), que
 * reemplaza a esta.
 */
export const alt = 'Home Pádel — Paletas, indumentaria y accesorios de pádel';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), 'public', 'home-padel-logo.png'));
  const logoSrc = 'data:image/png;base64,' + logo.toString('base64');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050606',
          borderBottom: '14px solid #B7D31A',
        }}
      >
        {/* <img> y no next/image: ImageResponse dibuja HTML plano, no componentes de Next. */}
        <img src={logoSrc} width={560} height={420} alt="" style={{ objectFit: 'contain' }} />
        <div style={{ marginTop: 8, fontSize: 36, color: '#C7C7C0', letterSpacing: 4, textTransform: 'uppercase' }}>
          Paletas, indumentaria y accesorios de pádel
        </div>
      </div>
    ),
    size,
  );
}
