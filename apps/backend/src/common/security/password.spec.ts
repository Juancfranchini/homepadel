import { hashPassword, verifyPassword } from './password';

describe('password security', () => {
  const originalRounds = process.env.BCRYPT_ROUNDS;

  afterEach(() => {
    if (originalRounds === undefined) delete process.env.BCRYPT_ROUNDS;
    else process.env.BCRYPT_ROUNDS = originalRounds;
  });

  it('guarda un hash bcrypt y verifica sin comparar texto plano', async () => {
    process.env.BCRYPT_ROUNDS = '10';
    const hash = await hashPassword('una-clave-segura');

    expect(hash).not.toBe('una-clave-segura');
    expect(hash).toMatch(/^\$2[aby]\$10\$/);
    await expect(verifyPassword('una-clave-segura', hash)).resolves.toBe(true);
    await expect(verifyPassword('otra-clave', hash)).resolves.toBe(false);
  });

  it('rechaza un costo bcrypt inseguro o excesivo', () => {
    process.env.BCRYPT_ROUNDS = '4';
    expect(() => hashPassword('clave')).toThrow('BCRYPT_ROUNDS');
  });
});
