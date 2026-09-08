import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';

@Module({
  imports: [
    HttpModule,
    CacheModule.register({ ttl: 3600000 }),
  ],
  controllers: [InstagramController],
  providers: [InstagramService],
})
export class InstagramModule {}
