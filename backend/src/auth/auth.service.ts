import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('El email ya esta registrado');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { ...dto, password: hashed },
      select: { id: true, email: true, name: true, role: true },
    });

    return { user, token: this.jwtService.sign({ sub: user.id, role: user.role }) };
  }

  async googleLogin(credential: string) {
    const payload = JSON.parse(Buffer.from(credential.split('.')[1], 'base64').toString());
    const { email, name, sub } = payload;

    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      const randomPassword = 'google_' + Math.random().toString(36).slice(2) + Date.now();
      const hashed = await bcrypt.hash(randomPassword, 10);
      user = await this.prisma.user.create({
        data: { email, name, password: hashed, role: 'CUSTOMER' },
      });
    }

    const { password: _, ...userData } = user;
    return { user: userData, token: this.jwtService.sign({ sub: user.id, role: user.role }) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciales invalidas');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales invalidas');

    const { password: _, ...userData } = user;
    return { user: userData, token: this.jwtService.sign({ sub: user.id, role: user.role }) };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'Si el email existe, recibirás un link de recuperación.' };

    const resetToken = this.jwtService.sign({ sub: user.id, type: 'reset' }, { expiresIn: '1h' });

    try {
      const resetUrl = (process.env.FRONTEND_URL || 'http://localhost:3000') + '/reset-password?token=' + resetToken;
      await this.emailService.sendEmail(
        email,
        'Recuperar contraseña - Home Padel',
        '<h1>Recuperar contraseña</h1><p>Hace click en el siguiente link:</p><p><a href="' + resetUrl + '">Resetear contraseña</a></p>',
      );
    } catch (e) {
      console.error('No se pudo enviar email de reset:', e);
    }

    return { success: true, message: 'Se envío un email con instrucciones para resetear la contraseña' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'reset') throw new UnauthorizedException('Token invalido');

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new NotFoundException('Usuario no encontrado');

      // M2 - Verificar si el token fue emitido antes del último cambio de contraseña
      if (user.updatedAt && payload.iat) {
        const tokenIssuedAt = new Date(payload.iat * 1000);
        if (user.updatedAt > tokenIssuedAt) {
          throw new UnauthorizedException('Token ya utilizado');
        }
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await this.prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

      return { success: true, message: 'Contraseña actualizada correctamente' };
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Token invalido o expirado');
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new UnauthorizedException('Contraseña actual incorrecta');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    return { success: true, message: 'Contraseña actualizada correctamente' };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, phone: true, address: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }
}