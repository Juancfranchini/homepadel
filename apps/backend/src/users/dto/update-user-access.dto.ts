import { ArrayUnique, IsArray, IsEnum, IsIn, IsString } from 'class-validator';
import { Role } from '@prisma/client';
import { ALL_POS_PERMISSIONS } from '../../common/permissions';

export class UpdateUserAccessDto {
  @IsEnum(Role)
  role: Role;

  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @IsIn(ALL_POS_PERMISSIONS, { each: true })
  permissions: string[];
}
