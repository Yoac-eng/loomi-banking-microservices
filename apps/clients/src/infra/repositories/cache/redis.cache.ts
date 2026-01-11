import 'dotenv/config';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

import type { ICache } from '../../../domain/interfaces/repositories/cache/cache.provider.interface';

@Injectable()
export class RedisCache implements ICache, OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisCache.name);

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis connection error: ${err.message}`, err.stack);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });
  }

  async set(
    key: string,
    value: unknown,
    ttlInSeconds: number = 3600,
  ): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.set(key, serializedValue, 'EX', ttlInSeconds);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to set cache key ${key}: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to get cache key ${key}: ${err.message}`,
        err.stack,
      );
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to delete cache key ${key}: ${err.message}`,
        err.stack,
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.client.quit();
      this.logger.log('Redis connection closed');
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error closing Redis connection: ${err.message}`,
        err.stack,
      );
    }
  }
}
