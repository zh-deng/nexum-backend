import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';
import { Request } from 'express';

type RateLimitMeta = { limit: number; ttlSeconds: number };

export const RateLimit = (limit: number, ttlSeconds: number) =>
  SetMetadata('rate_limit', { limit, ttlSeconds } as RateLimitMeta);

@Injectable()
export class RateLimitGuard implements CanActivate {
  private store = new Map<string, { count: number; expiresAt: number }>();
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const meta = this.reflector.get<RateLimitMeta>('rate_limit', context.getHandler());
    if (!meta) return true;

    // Identify the client by IP address
    const req = context.switchToHttp().getRequest<Request>();
    const ip = (req.ip ||
      req.headers['x-forwarded-for'] ||
      req.connection?.remoteAddress ||
      'unknown') as string;
    const key = `rl:${ip}:${context.getHandler().name}`;
    const now = Date.now();

    // Get existing record or initialize
    const existing = this.store.get(key);
    if (!existing || existing.expiresAt <= now) {
      this.store.set(key, { count: 1, expiresAt: now + meta.ttlSeconds * 1000 });
      return true;
    }

    // Check if limit exceeded
    if (existing.count >= meta.limit) {
      throw new HttpException(
        'Too many requests, please try again later',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    existing.count += 1;
    this.store.set(key, existing);
    return true;
  }
}
