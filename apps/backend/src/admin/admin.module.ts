import { Module } from '@nestjs/common';
import { AdminDeleteController } from './admin-delete.controller';
import { DeleteValidationModule } from '../delete-validation/delete-validation.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [DeleteValidationModule, PrismaModule],
  controllers: [AdminDeleteController],
})
export class AdminModule {}
