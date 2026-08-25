import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InstagramService } from './instagram.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Instagram')
@Controller('instagram')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @Get('posts')
  async getPosts(@Query('limit') limit: string) {
    const posts = await this.instagramService.getRecentPosts(parseInt(limit) || 6);
    if (posts.length > 0) return posts;

    // Fallback: devolver thumbnails de URLs manuales
    const config = await this.instagramService.getConfig();
    if (config?.manualUrls && Array.isArray(config.manualUrls)) {
      return config.manualUrls.slice(0, parseInt(limit) || 6).map((item: any) => {
        const url = typeof item === 'string' ? item : item.url;
        const thumbnail = typeof item === 'object' ? item.thumbnail : null;
        return {
          id: url,
          url: url,
          thumbnail_url: thumbnail || this.instagramService.getThumbnailUrl(url) || '',
          author_name: config.username || '@home.padel',
        };
      });
    }
    return [];
  }

  @Post('test-connection')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async testConnection(@Body() body: { appId: string; appSecret: string; postUrl: string }) {
    const ok = await this.instagramService.testConnection(body.appId, body.appSecret, body.postUrl);
    return { success: ok };
  }
}
