import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { IS_PUBLIC_KEY } from './public.decorator';

interface HttpHeaders {
  readonly [key: string]: string | string[] | undefined;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request: { headers: HttpHeaders; user?: unknown } = context
      .switchToHttp()
      .getRequest<{ headers: HttpHeaders; user?: unknown }>();
    const token = this.getBearerToken(request.headers);
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const payload: unknown = await this.jwtService.verifyAsync(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid bearer token');
    }
  }

  private getBearerToken(headers: HttpHeaders): string | undefined {
    const authorization: string | undefined = this.getHeaderValue(
      headers,
      'authorization',
    );
    if (!authorization) {
      return undefined;
    }
    const [scheme, token] = authorization.split(' ');
    if (scheme?.toLowerCase() !== 'bearer') {
      return undefined;
    }
    return token;
  }

  private getHeaderValue(
    headers: HttpHeaders,
    headerName: string,
  ): string | undefined {
    const value: string | string[] | undefined = headers[headerName];
    if (typeof value === 'string') {
      return value;
    }
    if (Array.isArray(value)) {
      return value[0];
    }
    const valueLowercase: string | string[] | undefined =
      headers[headerName.toLowerCase()];
    if (typeof valueLowercase === 'string') {
      return valueLowercase;
    }
    if (Array.isArray(valueLowercase)) {
      return valueLowercase[0];
    }
    return undefined;
  }
}
