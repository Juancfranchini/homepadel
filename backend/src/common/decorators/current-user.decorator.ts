// Decorador @CurrentUser — extrae el usuario autenticado del request
// Solo funciona en rutas protegidas con JwtAuthGuard
// Uso: findOne(@CurrentUser() user: any) { ... }

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
