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
    return this.instagramService.getRecentPosts(parseInt(limit) || 6);
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
