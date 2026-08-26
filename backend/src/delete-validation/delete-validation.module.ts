import { Module } from '@nestjs/common';
import { DeleteValidationService } from './delete-validation.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DeleteValidationService],
  exports: [DeleteValidationService],
})
export class DeleteValidationModule {}
