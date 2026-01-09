import { Module } from '@nestjs/common';

import { ClientsService } from './clients.service';

import { ClientsController } from './controllers/clients.controller';

@Module({
  imports: [],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
