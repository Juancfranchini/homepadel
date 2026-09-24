import { Controller, Post, Get, Body, UseGuards, Query, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleOAuthService } from './google-oauth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleCallbackDto, GoogleStartDto } from './dto/google-oauth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

const GOOGLE_PKCE_COOKIE = 'homepadel_google_pkce';

interface AuthenticatedUser {
  id: string;
}

function readCookie(request: Request, name: string): string | undefined {
  const raw = request.headers.cookie;
  if (!raw) return undefined;
  const entry = raw.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  if (!entry) return undefined;
  try {
    return decodeURIComponent(entry.slice(name.length + 1));
  } catch {
    return undefined;
  }
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleOAuth: GoogleOAuthService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Iniciar sesión' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('google/start')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Iniciar autenticación con Google' })
  googleStart(@Query() query: GoogleStartDto, @Res() response: Response) {
    if (!this.googleOAuth.isConfigured()) {
      return response.redirect(this.googleOAuth.errorRedirect('off'));
    }
    const started = this.googleOAuth.start(query.returnTo);
    response.cookie(GOOGLE_PKCE_COOKIE, started.verifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/google',
      maxAge: 10 * 60 * 1000,
    });
    return response.redirect(started.authorizationUrl);
  }

  @Get('google/callback')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Completar autenticación con Google' })
  async googleCallback(
    @Query() query: GoogleCallbackDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const verifier = readCookie(request, GOOGLE_PKCE_COOKIE);
    response.clearCookie(GOOGLE_PKCE_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/google',
    });
    if (query.error || !query.code || !query.state || !verifier) {
      return response.redirect(this.googleOAuth.errorRedirect());
    }
    try {
      const redirectUrl = await this.googleOAuth.complete(query.code, query.state, verifier);
      return response.redirect(redirectUrl);
    } catch {
      return response.redirect(this.googleOAuth.errorRedirect());
    }
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Solicitar recuperacion de contraseña' })
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Resetear contraseña con token' })
  resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @Post('change-password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cambiar contraseña' })
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(user.id, body.currentPassword, body.newPassword);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuario autenticado' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user.id);
  }
}
