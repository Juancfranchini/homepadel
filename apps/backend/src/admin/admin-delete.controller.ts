import { Controller, Get, Param, Delete, Body, UseGuards, ConflictException } from '@nestjs/common';
import { DeleteValidationService } from '../delete-validation/delete-validation.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminDeleteController {
  constructor(
    private deleteValidation: DeleteValidationService,
    private prisma: PrismaService,
  ) {}

  @Get(':entityType/:entityId/check')
  @Roles('ADMIN')
  async checkDependencies(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    const result = await this.deleteValidation.validateDelete(entityType, entityId);
    return {
      success: true,
      requiresConfirmation: result.requiresConfirmation,
      relatedData: result,
    };
  }

  @Delete(':entityType/:entityId')
  @Roles('ADMIN')
  async deleteEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Body() body: { force?: boolean },
  ) {
    const check = await this.deleteValidation.validateDelete(entityType, entityId);

    if (check.hasOrders && !body.force) {
      throw new ConflictException('No se puede eliminar porque tiene pedidos asociados');
    }

    let result;
    const softDeleteEntities = ['brand', 'category', 'product', 'user'];

    if (softDeleteEntities.includes(entityType)) {
      result = await this.prisma[entityType].update({
        where: { id: entityId },
        data: { active: false },
      });
    } else {
      result = await this.prisma[entityType].delete({
        where: { id: entityId },
      });
    }

    return {
      success: true,
      message: `${entityType} eliminado correctamente`,
      data: result,
    };
  }
}
