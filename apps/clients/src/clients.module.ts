import { Module } from '@nestjs/common';
import {
  ClientsModule as MicroservicesClientsModule,
  Transport,
} from '@nestjs/microservices';

import { CreateUserUseCase } from './application/useCases/create-user.use-case';
import { GetUserByIdUseCase } from './application/useCases/get-user-by-id.use-case';
import { ProcessTransactionUseCase } from './application/useCases/process-transaction.use-case';
import { UpdateProfilePictureUseCase } from './application/useCases/update-profile-picture.use-case';
import { UpdateUserUseCase } from './application/useCases/update-user.use-case';
import { ClientsRmqController } from './controllers/clients-rmq.controller';
import { ClientsController } from './controllers/clients.controller';
import type { ICache } from './domain/interfaces/repositories/cache/cache.provider.interface';
import type { IUserRepository } from './domain/interfaces/repositories/user.repository.interface';
import { RabbitMQPublisher } from './infra/messaging/rabbitmq-publisher';
import { RMQ_CONFIG } from './infra/messaging/rmq.config';
import { RedisCache } from './infra/repositories/cache/redis.cache';
import { CachedUserRepository } from './infra/repositories/cached-user.repository';
import { PostgresLedgerEntryRepository } from './infra/repositories/postgres-ledger-entry.repository';
import { PostgresUserRepository } from './infra/repositories/postgres-user.repository';
import { S3StorageRepository } from './infra/repositories/s3-storage.repository';

@Module({
  imports: [
    MicroservicesClientsModule.register([
      {
        name: 'TRANSACTIONS_RMQ_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: RMQ_CONFIG.queues.completed,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [ClientsController, ClientsRmqController],
  providers: [
    PostgresUserRepository,
    {
      provide: 'IUserRepositoryDelegate',
      useClass: PostgresUserRepository,
    },
    {
      provide: 'ICache',
      useClass: RedisCache,
    },
    {
      provide: 'IUserRepository',
      useFactory: (delegate: IUserRepository, cache: ICache) => {
        return new CachedUserRepository(delegate, cache);
      },
      inject: ['IUserRepositoryDelegate', 'ICache'],
    },
    {
      provide: 'IStorageRepository',
      useClass: S3StorageRepository,
    },
    PostgresLedgerEntryRepository,
    {
      provide: 'ILedgerEntryRepository',
      useClass: PostgresLedgerEntryRepository,
    },
    RabbitMQPublisher,
    ProcessTransactionUseCase,
    CreateUserUseCase,
    GetUserByIdUseCase,
    UpdateProfilePictureUseCase,
    UpdateUserUseCase,
  ],
  exports: [
    CreateUserUseCase,
    GetUserByIdUseCase,
    UpdateProfilePictureUseCase,
    UpdateUserUseCase,
  ],
})
export class ClientsModule {}
