import { Module } from '@nestjs/common';
import { CatalogFeedController } from './catalog-feed.controller';

@Module({
  controllers: [CatalogFeedController],
})
export class CatalogFeedModule {}
