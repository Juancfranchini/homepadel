import { createHash, randomBytes } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { PrismaService } from '../prisma/prisma.service';

const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

interface OAuthState {
  type: 'google-oauth';
  nonce: string;
  returnTo: string;
}

interface GoogleClaims {
  subject: string;
  email: string;
  name: string;
}

export interface GoogleLoginStart {
  authorizationUrl: string;
  verifier: string;
}

function safeInternalPath(value?: string): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/cuenta';
  return value;
}

@Injectable()
export class GoogleOAuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  isConfigured(): boolean {
    return Boolean(this.clientId() && this.clientSecret());
  }

  start(returnTo?: string): GoogleLoginStart {
    const verifier = randomBytes(32).toString('base64url');
    const nonce = randomBytes(24).toString('base64url');
    const state = this.jwt.sign(
      { type: 'google-oauth', nonce, returnTo: safeInternalPath(returnTo) } satisfies OAuthState,
      { expiresIn: '10m' },
    );
    const query = new URLSearchParams({
      client_id: this.clientId(),
      redirect_uri: this.redirectUri(),
      response_type: 'code',
      scope: 'openid email profile',
      state,
      nonce,
      code_challenge: createHash('sha256').update(verifier).digest('base64url'),
      code_challenge_method: 'S256',
      prompt: 'select_account',
    });
    return {
      authorizationUrl: `https://accounts.google.com/o/oauth2/v2/auth?${query}`,
      verifier,
    };
  }

  async complete(code: string, stateToken: string, verifier: string): Promise<string> {
    const state = this.verifyState(stateToken);
    const idToken = await this.exchangeCode(code, verifier);
    const claims = await this.verifyIdToken(idToken, state.nonce);
    const user = await this.findOrCreateUser(claims);
    const token = this.jwt.sign({ sub: user.id, role: user.role });
    return this.successRedirect(token, state.returnTo);
  }

  errorRedirect(reason: 'error' | 'off' = 'error'): string {
    const url = new URL('/cuenta', this.frontendUrl());
    url.searchParams.set('google', reason);
    return url.toString();
  }

  private verifyState(token: string): OAuthState {
    try {
      const state = this.jwt.verify<OAuthState>(token);
      if (state.type !== 'google-oauth' || !state.nonce) throw new Error('invalid_state');
      return { ...state, returnTo: safeInternalPath(state.returnTo) };
    } catch {
      throw new UnauthorizedException('La sesión de Google venció o no es válida');
    }
  }

  private async exchangeCode(code: string, verifier: string): Promise<string> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.clientId(),
        client_secret: this.clientSecret(),
        redirect_uri: this.redirectUri(),
        grant_type: 'authorization_code',
        code_verifier: verifier,
      }),
    });
    if (!response.ok) throw new UnauthorizedException('Google no pudo validar el acceso');
    const body = (await response.json()) as { id_token?: string };
    if (!body.id_token) throw new UnauthorizedException('Google no devolvió una identidad válida');
    return body.id_token;
  }

  private async verifyIdToken(idToken: string, nonce: string): Promise<GoogleClaims> {
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: GOOGLE_ISSUERS,
      audience: this.clientId(),
    });
    if (payload.nonce !== nonce || payload.email_verified !== true) {
      throw new UnauthorizedException('Google no confirmó el email');
    }
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
      throw new UnauthorizedException('Google no devolvió una identidad válida');
    }
    const fallbackName = payload.email.split('@')[0];
    return {
      subject: payload.sub,
      email: payload.email.trim().toLowerCase(),
      name: typeof payload.name === 'string' && payload.name.trim() ? payload.name.trim() : fallbackName,
    };
  }

  private async findOrCreateUser(claims: GoogleClaims) {
    return this.prisma.$transaction(async (tx) => {
      const identity = await tx.authIdentity.findUnique({
        where: { provider_providerUserId: { provider: 'google', providerUserId: claims.subject } },
        include: { user: true },
      });
      if (identity) return identity.user;

      const existingUser = await tx.user.findFirst({
        where: { email: { equals: claims.email, mode: 'insensitive' } },
      });
      const user = existingUser ?? await tx.user.create({
        data: { email: claims.email, name: claims.name, password: null },
      });
      await tx.authIdentity.create({
        data: {
          provider: 'google',
          providerUserId: claims.subject,
          email: claims.email,
          emailVerified: true,
          userId: user.id,
        },
      });
      return user;
    });
  }

  private successRedirect(token: string, returnTo: string): string {
    const url = new URL('/cuenta', this.frontendUrl());
    url.searchParams.set('google', 'success');
    url.hash = new URLSearchParams({ token, returnTo: safeInternalPath(returnTo) }).toString();
    return url.toString();
  }

  private clientId(): string {
    return this.config.get<string>('GOOGLE_CLIENT_ID', '');
  }

  private clientSecret(): string {
    return this.config.get<string>('GOOGLE_CLIENT_SECRET', '');
  }

  private redirectUri(): string {
    const backendUrl = this.config.get<string>('BACKEND_URL', 'http://localhost:4000').replace(/\/$/, '');
    return this.config.get<string>('GOOGLE_REDIRECT_URI', `${backendUrl}/api/auth/google/callback`);
  }

  private frontendUrl(): string {
    return this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
  }
}
