// Estrategia Local para Passport — autenticación con email y password
// Usado internamente; el login principal usa AuthService.login() con DTO
// Se configura para usar 'email' como campo de usuario (en lugar de 'username')

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { PrismaService } from '../../prisma/prisma.service';
import { verifyPassword } from '../../common/security/password';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password || !(await verifyPassword(password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return user;
  }
}
