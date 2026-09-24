import * as bcrypt from 'bcrypt';

function hashRounds(): number {
  const configured = Number(process.env.BCRYPT_ROUNDS ?? '10');
  if (!Number.isInteger(configured) || configured < 10 || configured > 15) {
    throw new Error('BCRYPT_ROUNDS debe ser un entero entre 10 y 15');
  }
  return configured;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, hashRounds());
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
