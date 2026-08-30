import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import axios from 'axios';

@ApiTags('Track')
@Controller('track')
export class TrackController {
  @Post()
  async track(@Body() body: any, @Req() req: any) {
    try {
      const { eventName, eventId, eventSourceUrl, pixelId } = body;

      if (!pixelId) return { success: false, message: 'pixelId requerido' };

      const accessToken = process.env.META_ACCESS_TOKEN || '';
      const testEventCode = process.env.META_TEST_EVENT_CODE || '';

      const cookies = req.headers.cookie || '';
      const fbp = this.getCookie(cookies, '_fbp');
      const fbc = this.getCookie(cookies, '_fbc');
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      const clientUserAgent = req.headers['user-agent'] || '';

      const apiUrl = 'https://graph.facebook.com/v21.0/' + pixelId + '/events';

      const payload: any = {
        data: [{
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: eventSourceUrl,
          action_source: 'website',
          user_data: {
            fbp: fbp || undefined,
            fbc: fbc || undefined,
            client_ip_address: clientIp || undefined,
            client_user_agent: clientUserAgent || undefined,
          },
        }],
      };

      const params: any = {};
      if (accessToken) {
        params.access_token = accessToken;
      }
      if (testEventCode) {
        params.test_event_code = testEventCode;
      }

      if (Object.keys(params).length > 0) {
        await axios.post(apiUrl, payload, { params });
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Error' };
    }
  }

  private getCookie(cookies: string, name: string): string | null {
    const match = cookies.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }
}
