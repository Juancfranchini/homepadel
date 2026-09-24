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

  /**
   * Las publicaciones que se muestran en el inicio.
   *
   * Son las que carga la tienda a mano en el backoffice, con su enlace y una
   * miniatura propia. No se traen solas del perfil: listar las publicaciones
   * de una cuenta exige una app de Meta aprobada, que no se tramitó.
   *
   * Antes esto exigía esas credenciales incluso para las cargadas a mano: sin
   * `appId` y `appSecret` cortaba en la primera línea y devolvía vacío. Así
   * que las miniaturas que el backoffice pedía subir —y decía que iba a usar
   * si la API fallaba— no se usaban nunca y la sección quedaba en blanco.
   *
   * Con miniatura propia no se llama a Meta: es más rápido y no depende de
   * nadie. La API queda solo para completar las que no tengan imagen.
   */
  async getRecentPosts(limit: number = 6): Promise<InstagramPost[]> {
    const config = await this.getConfig();
    const cargadas = this.normalizarManuales(config?.manualUrls).slice(0, limit);
    if (cargadas.length === 0) return [];

    const accessToken =
      config?.appId && config?.appSecret ? config.appId + '|' + config.appSecret : null;

    const posts = await Promise.all(
      cargadas.map(async (item): Promise<InstagramPost | null> => {
        if (item.thumbnail) {
          return { id: item.url, url: item.url, thumbnail_url: item.thumbnail, author_name: '' };
        }
        // Sin imagen subida solo queda preguntarle a Meta. Si no hay
        // credenciales, la publicación se omite: mostrar un recuadro vacío en
        // su lugar es peor que no mostrarla.
        return accessToken ? this.fetchOEmbed(item.url, accessToken) : null;
      }),
    );

    return posts.filter((p): p is InstagramPost => p !== null);
  }

  /** El backoffice guardó `string[]` en versiones viejas y `{url, thumbnail}[]` ahora. */
  private normalizarManuales(valor: unknown): { url: string; thumbnail: string }[] {
    if (!Array.isArray(valor)) return [];
    return valor
      .map((item) =>
        typeof item === 'string'
          ? { url: item, thumbnail: '' }
          : { url: String(item?.url ?? ''), thumbnail: String(item?.thumbnail ?? '') },
      )
      .filter((item) => item.url.trim().length > 0);
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

  // Había acá un `getThumbnailUrl` que armaba la dirección
  // `instagram.com/<tipo>/<código>/media/?size=m`. Instagram dejó de servir esa
  // ruta hace años: siempre devolvía una imagen rota, y encima no reconocía los
  // enlaces que incluyen el usuario. La miniatura sale de la que sube la
  // tienda, o de la API de Meta si está configurada.

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
