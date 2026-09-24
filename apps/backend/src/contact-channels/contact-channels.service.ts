import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface PublicChannelIdentity {
  title: string;
  url: string;
}

export function shouldExposePublicChannel(channel: PublicChannelIdentity): boolean {
  if (process.env.MESSENGER_CHANNEL_ENABLED === 'true') return true;
  const isMessenger = /messenger/i.test(channel.title) || /(^|\/\/)(www\.)?m\.me\//i.test(channel.url);
  return !isMessenger;
}

@Injectable()
export class ContactChannelsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const channels = await this.prisma.contactChannel.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    return channels.filter(shouldExposePublicChannel);
  }

  findAllAdmin() {
    return this.prisma.contactChannel.findMany({ orderBy: { order: 'asc' } });
  }

  create(dto: any) {
    return this.prisma.contactChannel.create({ data: dto });
  }

  async update(id: string, dto: any) {
    const item = await this.prisma.contactChannel.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Canal no encontrado');
    return this.prisma.contactChannel.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const item = await this.prisma.contactChannel.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Canal no encontrado');
    return this.prisma.contactChannel.delete({ where: { id } });
  }
}
