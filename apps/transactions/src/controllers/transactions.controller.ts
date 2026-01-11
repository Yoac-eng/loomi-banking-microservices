import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
  createTransactionSchema,
  type CreateTransactionDto,
} from '../application/dtos/create-transaction.dto';
import { CreateTransactionUseCase } from '../application/useCases/create-transaction.use-case';
import { GetTransactionByIdUseCase } from '../application/useCases/get-transaction-by-id.use-case';
import { GetTransactionsByUserIdUseCase } from '../application/useCases/get-transactions-by-user-id.use-case';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

import { CreateTransactionRequestDto } from './dtos/create-transaction-request.dto';
import { TransactionResponseDto } from './dtos/transaction-response.dto';

@Controller('api/transactions')
@ApiTags('transactions')
@ApiSecurity('apiKey')
@UseGuards(ApiKeyGuard)
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getTransactionByIdUseCase: GetTransactionByIdUseCase,
    private readonly getTransactionsByUserIdUseCase: GetTransactionsByUserIdUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Initiate a new transfer' })
  @ApiBody({ type: CreateTransactionRequestDto })
  @ApiCreatedResponse({ type: TransactionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid API key' })
  @UsePipes(new ZodValidationPipe(createTransactionSchema)) // TODO: set idempotency key to be a header
  async createTransaction(@Body() data: CreateTransactionDto) {
    const transaction = await this.createTransactionUseCase.execute(data);
    return transaction.toJson();
  }

  @Get(':transactionId')
  @ApiOperation({ summary: 'Get a transaction by id' })
  @ApiParam({ name: 'transactionId', format: 'uuid' })
  @ApiOkResponse({ type: TransactionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid API key' })
  async getTransactionById(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
  ) {
    const transaction =
      await this.getTransactionByIdUseCase.execute(transactionId);
    return transaction.toJson();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'List transactions for a user' })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiOkResponse({ type: TransactionResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid API key' })
  async getTransactionsByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    const transactions =
      await this.getTransactionsByUserIdUseCase.execute(userId);
    return transactions.map((transaction) => transaction.toJson());
  }
}
