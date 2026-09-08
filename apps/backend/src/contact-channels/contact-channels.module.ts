import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ContactChannelsService } from './contact-channels.service';
import { ContactChannelsController } from './contact-channels.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ContactChannelsController],
  providers: [ContactChannelsService],
})
export class ContactChannelsModule {}
