import { Module } from '@nestjs/common';

import { CreateUserUseCase } from './application/useCases/create-user.use-case';
import { GetUserByIdUseCase } from './application/useCases/get-user-by-id.use-case';
import { UpdateProfilePictureUseCase } from './application/useCases/update-profile-picture.use-case';
import { UpdateUserUseCase } from './application/useCases/update-user.use-case';
import { ClientsController } from './controllers/clients.controller';
import { S3StorageProvider } from './infra/providers/s3-storage.provider';
import { PostgresUserRepository } from './infra/repositories/postgres-user.repository';

@Module({
  imports: [],
  controllers: [ClientsController],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: PostgresUserRepository,
    },
    {
      provide: 'IStorageProvider',
      useClass: S3StorageProvider,
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
