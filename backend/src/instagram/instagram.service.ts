import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

export interface InstagramPost {
  id: string;
  url: string;
  thumbnail_url: string;
  author_name: string;
  html?: string;
}

@Injectable()
export class InstagramService {
  private readonly GRAPH_URL = 'https://graph.facebook.com/v25.0/instagram_oembed';

  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async getConfig() {
    const section = await this.prisma.siteSection.findUnique({ where: { key: 'instagram' } });
    if (!section?.data) return null;
    return section.data as Record<string, any>;
  }

  async getRecentPosts(limit: number = 6): Promise<InstagramPost[]> {
    const config = await this.getConfig();
    if (!config || !config.appId || !config.appSecret) {
      return [];
    }

    const accessToken = config.appId + '|' + config.appSecret;

    try {
      if (config.manualUrls && Array.isArray(config.manualUrls) && config.manualUrls.length > 0) {
        const posts = await Promise.all(
          config.manualUrls.slice(0, limit).map((url: string) => this.fetchOEmbed(url, accessToken)),
        );
        return posts.filter((p): p is InstagramPost => p !== null);
      }
      return [];
    } catch {
      return [];
    }
  }

  async fetchOEmbed(postUrl: string, accessToken: string): Promise<InstagramPost | null> {
    try {
      const { data } = await firstValueFrom(
        this.http.get(this.GRAPH_URL, {
          params: { url: postUrl, access_token: accessToken, maxwidth: 640 },
        }),
      );
      return {
        id: data.media_id || postUrl,
        url: postUrl,
        thumbnail_url: data.thumbnail_url || '',
        author_name: data.author_name || '',
        html: data.html || '',
      };
    } catch {
      return null;
    }
  }

  async testConnection(appId: string, appSecret: string, postUrl: string): Promise<boolean> {
    try {
      const token = appId + '|' + appSecret;
      const result = await this.fetchOEmbed(postUrl, token);
      return result !== null;
    } catch {
      return false;
    }
  }
}
