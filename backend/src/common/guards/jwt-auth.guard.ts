// Guard de autenticación JWT
// Usar con @UseGuards(JwtAuthGuard) en controladores o rutas individuales
// Rechaza requests sin token válido con 401 Unauthorized

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
