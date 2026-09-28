/**
 * El registro exige aceptar términos y condiciones (acceptTerms === true) y
 * admite un opt-in opcional de novedades (acceptMarketing). Se valida con la
 * misma configuración del ValidationPipe global (whitelist +
 * forbidNonWhitelisted), así que un campo no declarado en el DTO rompe el
 * registro entero.
 */

import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './register.dto';

const base = { name: 'Ana Pérez', email: 'ana@example.com', password: 'secreta123' };

async function errores(body: Record<string, unknown>) {
  const dto = plainToInstance(RegisterDto, body);
  return validate(dto, { whitelist: true, forbidNonWhitelisted: true });
}

describe('RegisterDto — términos y novedades', () => {
  it('acepta el registro con términos aceptados y novedades tildadas', async () => {
    expect(await errores({ ...base, acceptTerms: true, acceptMarketing: true })).toHaveLength(0);
  });

  it('acepta el registro sin acceptMarketing (es opcional)', async () => {
    expect(await errores({ ...base, acceptTerms: true })).toHaveLength(0);
  });

  it('rechaza si no se aceptaron los términos', async () => {
    const result = await errores({ ...base, acceptTerms: false, acceptMarketing: true });
    expect(result.map((e) => e.property)).toContain('acceptTerms');
  });

  it('rechaza si acceptTerms no viene', async () => {
    const result = await errores({ ...base });
    expect(result.map((e) => e.property)).toContain('acceptTerms');
  });

  it('rechaza acceptTerms como string "true" (tiene que ser booleano)', async () => {
    const result = await errores({ ...base, acceptTerms: 'true' });
    expect(result.map((e) => e.property)).toContain('acceptTerms');
  });
});
