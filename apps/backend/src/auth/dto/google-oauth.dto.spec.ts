/**
 * El login con Google fallaba con 400 en producción: `redirect_uri_mismatch`
 * ya resuelto, esto era el paso siguiente. La aplicación usa un
 * ValidationPipe global con `forbidNonWhitelisted: true` (main.ts), así que
 * cualquier query param que llegue y el DTO no declare tumba la petición
 * entera antes de que el controller la vea.
 *
 * Google agrega a la URL de vuelta parámetros propios del protocolo OAuth
 * —iss, scope, authuser, prompt, y hd en cuentas de Workspace— que nada tiene
 * que ver con lo que la app pidió. El DTO viejo solo declaraba code, state y
 * error, así que TODO login real (nunca los mockeados a mano) se rechazaba.
 *
 * Se valida con la misma configuración que usa la app, no una relajada a
 * propósito para la prueba.
 */

import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GoogleCallbackDto } from './google-oauth.dto';

/** Reproduce el whitelist + forbidNonWhitelisted del ValidationPipe global. */
async function erroresDeWhitelist(query: Record<string, string>) {
  const dto = plainToInstance(GoogleCallbackDto, query, { excludeExtraneousValues: false });
  return validate(dto, { whitelist: true, forbidNonWhitelisted: true });
}

describe('GoogleCallbackDto — la vuelta real de Google, no la ideal', () => {
  it('acepta la URL de vuelta tal como la manda Google en un login exitoso', async () => {
    const errores = await erroresDeWhitelist({
      code: '4/0Ab_abc123',
      state: 'eyJhbGciOi...',
      scope: 'email profile openid https://www.googleapis.com/auth/userinfo.email',
      authuser: '0',
      prompt: 'consent',
      iss: 'https://accounts.google.com',
    });
    expect(errores).toHaveLength(0);
  });

  it('acepta también `hd`, presente cuando la cuenta es de Google Workspace', async () => {
    const errores = await erroresDeWhitelist({ code: 'abc', hd: 'homepadel.com.ar' });
    expect(errores).toHaveLength(0);
  });

  it('acepta la vuelta cuando el usuario cancela el consentimiento', async () => {
    const errores = await erroresDeWhitelist({ error: 'access_denied', state: 'xyz' });
    expect(errores).toHaveLength(0);
  });

  it('sigue rechazando un parámetro realmente ajeno', async () => {
    const errores = await erroresDeWhitelist({ code: 'abc', algo_que_no_es_de_google: 'x' });
    expect(errores.length).toBeGreaterThan(0);
  });
});
