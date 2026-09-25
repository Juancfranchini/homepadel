import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

interface PermissionUser {
  role: Role;
  permissions?: string[];
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const request = context.switchToHttp().getRequest<{ user?: PermissionUser }>();
    const user = request.user;
    if (user?.role === Role.ADMIN) return true;
    if (user && required.every((permission) => user.permissions?.includes(permission))) return true;

    throw new ForbiddenException('No tenés permiso para realizar esta operación');
  }
}
