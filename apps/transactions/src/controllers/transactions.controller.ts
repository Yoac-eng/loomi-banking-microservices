import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UsePipes,
} from '@nestjs/common';

import {
  createTransactionSchema,
  type CreateTransactionDto,
} from '../application/dtos/create-transaction.dto';
import { CreateTransactionUseCase } from '../application/useCases/create-transaction.use-case';
import { GetTransactionByIdUseCase } from '../application/useCases/get-transaction-by-id.use-case';
import { GetTransactionsByUserIdUseCase } from '../application/useCases/get-transactions-by-user-id.use-case';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('api/transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getTransactionByIdUseCase: GetTransactionByIdUseCase,
    private readonly getTransactionsByUserIdUseCase: GetTransactionsByUserIdUseCase,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createTransactionSchema)) // TODO: set idempotency key to be a header
  async createTransaction(@Body() data: CreateTransactionDto) {
    const transaction = await this.createTransactionUseCase.execute(data);
    return transaction.toJson();
  }

  @Get(':transactionId')
  async getTransactionById(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
  ) {
    const transaction =
      await this.getTransactionByIdUseCase.execute(transactionId);
    return transaction.toJson();
  }

  @Get('user/:userId')
  async getTransactionsByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    const transactions =
      await this.getTransactionsByUserIdUseCase.execute(userId);
    return transactions.map((transaction) => transaction.toJson());
  }
}
