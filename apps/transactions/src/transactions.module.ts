import { Module } from '@nestjs/common';

import { TransactionsController } from './transactions.controller';

@Module({
  imports: [],
  controllers: [TransactionsController],
  providers: [],
})
export class TransactionsModule {}
