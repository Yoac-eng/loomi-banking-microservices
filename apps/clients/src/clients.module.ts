import { Module } from '@nestjs/common';

import { CreateUserUseCase } from './application/useCases/create-user.use-case';
import { GetUserByIdUseCase } from './application/useCases/get-user-by-id.use-case';
import { UpdateProfilePictureUseCase } from './application/useCases/update-profile-picture.use-case';
import { UpdateUserUseCase } from './application/useCases/update-user.use-case';
import { ClientsController } from './controllers/clients.controller';
import type { ICache } from './domain/interfaces/repositories/cache/cache.provider.interface';
import type { IUserRepository } from './domain/interfaces/repositories/user.repository.interface';
import { RedisCache } from './infra/repositories/cache/redis.cache';
import { CachedUserRepository } from './infra/repositories/cached-user.repository';
import { PostgresUserRepository } from './infra/repositories/postgres-user.repository';
import { S3StorageRepository } from './infra/repositories/s3-storage.repository';

@Module({
  imports: [],
  controllers: [ClientsController],
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
