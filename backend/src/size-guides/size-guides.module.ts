import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SizeGuidesService } from './size-guides.service';
import { SizeGuidesController } from './size-guides.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SizeGuidesController],
  providers: [SizeGuidesService],
})
export class SizeGuidesModule {}
