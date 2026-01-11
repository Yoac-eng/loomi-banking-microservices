import { Module } from '@nestjs/common';

import type { ICache } from './domain/interfaces/repositories/cache/cache.provider.interface';
import type { ITransactionRepository } from './domain/interfaces/repositories/transaction.repository.interface';
import { RedisCache } from './infra/repositories/cache/redis.cache';
import { CachedTransactionRepository } from './infra/repositories/cached-transaction.repository';
import { PostgresTransactionLifecycleLogRepository } from './infra/repositories/postgres-transaction-lifecycle-log.repository';
import { PostgresTransactionRepository } from './infra/repositories/postgres-transaction.repository';
import { TransactionsController } from './transactions.controller';

@Module({
  imports: [],
  controllers: [TransactionsController],
  providers: [
    PostgresTransactionRepository,
    {
      provide: 'ITransactionRepositoryDelegate',
      useClass: PostgresTransactionRepository,
    },
    {
      provide: 'ICache',
      useClass: RedisCache,
    },
    {
      provide: 'ITransactionRepository',
      useFactory: (delegate: ITransactionRepository, cache: ICache) => {
        return new CachedTransactionRepository(delegate, cache);
      },
      inject: ['ITransactionRepositoryDelegate', 'ICache'],
    },
    PostgresTransactionLifecycleLogRepository,
    {
      provide: 'ITransactionLifecycleLogRepository',
      useClass: PostgresTransactionLifecycleLogRepository,
    },
  ],
})
export class TransactionsModule {}
