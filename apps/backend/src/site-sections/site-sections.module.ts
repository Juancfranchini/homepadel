import { Module } from '@nestjs/common';
import { SiteSectionsController } from './site-sections.controller';
import { SiteSectionsService } from './site-sections.service';

@Module({
  controllers: [SiteSectionsController],
  providers: [SiteSectionsService],
})
export class SiteSectionsModule {}
