import { Module } from '@nestjs/common';

import { CreateUserUseCase } from './application/useCases/create-user.use-case';
import { GetUserByIdUseCase } from './application/useCases/get-user-by-id.use-case';
import { ClientsController } from './controllers/clients.controller';
import { PostgresUserRepository } from './infra/repositories/postgres-user.repository';

@Module({
  imports: [],
  controllers: [ClientsController],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: PostgresUserRepository,
    },
    CreateUserUseCase,
    GetUserByIdUseCase,
  ],
  exports: [CreateUserUseCase, GetUserByIdUseCase],
})
export class ClientsModule {}
