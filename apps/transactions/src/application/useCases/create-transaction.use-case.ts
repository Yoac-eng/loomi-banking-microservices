import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionStatus } from '../../domain/enum/transaction-status.enum';
import type { IClientsServiceClient } from '../../domain/interfaces/http/clients-service-client.interface';
import type { IBrokerMessagePublisher } from '../../domain/interfaces/messaging/broker-message-publisher.interface';
import type { ITransactionRepository } from '../../domain/interfaces/repositories/transaction.repository.interface';
import { TransactionLifecycleLogger } from '../services/transaction-lifecycle-logger.service';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    @Inject('IClientsServiceClient')
    private readonly clientsServiceClient: IClientsServiceClient,
    @Inject('IBrokerMessagePublisher')
    private readonly brokerMessagePublisher: IBrokerMessagePublisher,
    private readonly lifecycleLogger: TransactionLifecycleLogger,
  ) {}

  async execute(data: {
    senderUserId: string;
    receiverUserId: string;
    amount: number;
    description?: string | null;
    idempotencyKey: string;
  }): Promise<Transaction> {
    // Check idempotency
    const existingTransaction =
      await this.transactionRepository.findByIdempotencyKey(
        data.idempotencyKey,
      );

    if (existingTransaction) {
      return existingTransaction; // Idempotent - return existing transaction
    }

    const sender = await this.clientsServiceClient.getUserWithBankingDetails(
      data.senderUserId,
    );

    if (!sender.bankingDetails) {
      throw new NotFoundException(
        `Banking details not found for sender ${data.senderUserId}`,
      );
    }

    const receiver = await this.clientsServiceClient.getUserWithBankingDetails(
      data.receiverUserId,
    );

    if (!receiver.bankingDetails) {
      throw new NotFoundException(
        `Banking details not found for receiver ${data.receiverUserId}`,
      );
    }

    console.log('sender', sender);
    console.log('receiver', receiver);
    console.log('data', data);
    // Validate sufficient balance
    const transactionAmountCents = data.amount; // Convert to cents
    console.log('transactionAmountCents', transactionAmountCents);
    if (sender.bankingDetails.balanceCents < transactionAmountCents) {
      throw new BadRequestException('Insufficient balance');
    }

    // Create transaction with status PENDING
    const transaction = new Transaction({
      senderUserId: data.senderUserId,
      receiverUserId: data.receiverUserId,
      amountCents: transactionAmountCents,
      description: data.description ?? null,
      status: TransactionStatus.PENDING,
      idempotencyKey: data.idempotencyKey,
    });

    await this.transactionRepository.create(transaction);

    // Create initial log (null → PENDING)
    await this.lifecycleLogger.logStatusChange(
      transaction.id,
      null,
      TransactionStatus.PENDING,
      'Transaction created',
    );

    // Publish message to broker
    await this.brokerMessagePublisher.publishTransactionProcess({
      transactionId: transaction.id,
      senderUserId: data.senderUserId,
      receiverUserId: data.receiverUserId,
      amountCents: transactionAmountCents,
      idempotencyKey: data.idempotencyKey,
    });

    return transaction;
  }
}
