import { BadRequestException, NotFoundException } from '@nestjs/common';

import { Transaction } from '../../../src/domain/entities/transaction.entity';
import { TransactionStatus } from '../../../src/domain/enum/transaction-status.enum';
import type { IClientsServiceClient } from '../../../src/domain/interfaces/http/clients-service-client.interface';
import type { IBrokerMessagePublisher } from '../../../src/domain/interfaces/messaging/broker-message-publisher.interface';
import type { ITransactionRepository } from '../../../src/domain/interfaces/repositories/transaction.repository.interface';
import { Amount } from '../../../src/domain/value-objects/amount.value-object';
import { TransactionLifecycleLogger } from '../../../src/application/services/transaction-lifecycle-logger.service';
import { CreateTransactionUseCase } from '../../../src/application/useCases/create-transaction.use-case';

describe('CreateTransactionUseCase', () => {
  it('should return existing transaction when idempotencyKey already exists', async () => {
    const existingTransaction = new Transaction({
      senderUserId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      receiverUserId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      amount: Amount.create(1000),
      description: null,
      status: TransactionStatus.SUCCESS,
      idempotencyKey: 'idem-1',
    });
    const mockRepository: ITransactionRepository = {
      create: async () => undefined,
      findById: async () => null,
      findBySenderUserId: async () => [],
      findByReceiverUserId: async () => [],
      findByUserId: async () => [],
      findByIdempotencyKey: async () => existingTransaction,
      update: async () => undefined,
      delete: async () => undefined,
    };
    const mockClientsClient: IClientsServiceClient = {
      getUserWithBankingDetails: async () => {
        throw new Error('should not call');
      },
    };
    const mockPublisher: IBrokerMessagePublisher = {
      publishTransactionProcess: async () => undefined,
    };
    const mockLifecycleLogger: TransactionLifecycleLogger = {
      logStatusChange: async () => undefined,
    } as unknown as TransactionLifecycleLogger;

    const useCase = new CreateTransactionUseCase(
      mockRepository,
      mockClientsClient,
      mockPublisher,
      mockLifecycleLogger,
    );

    const actual = await useCase.execute({
      senderUserId: 'x',
      receiverUserId: 'y',
      amount: 5000,
      description: 'ignored',
      idempotencyKey: 'idem-1',
    });

    expect(actual.idempotencyKey).toBe('idem-1');
    expect(actual.id).toBe(existingTransaction.id);
  });

  it('should throw when sender has insufficient balance', async () => {
    const mockRepository: ITransactionRepository = {
      create: async () => undefined,
      findById: async () => null,
      findBySenderUserId: async () => [],
      findByReceiverUserId: async () => [],
      findByUserId: async () => [],
      findByIdempotencyKey: async () => null,
      update: async () => undefined,
      delete: async () => undefined,
    };
    const mockClientsClient: IClientsServiceClient = {
      getUserWithBankingDetails: async (userId: string) => {
        return {
          id: userId,
          bankingDetails: {
            balanceCents: 1000n,
            accountNumber: '1',
            agency: '1',
          },
        };
      },
    };
    const mockPublisher: IBrokerMessagePublisher = {
      publishTransactionProcess: async () => undefined,
    };
    const mockLifecycleLogger: TransactionLifecycleLogger = {
      logStatusChange: async () => undefined,
    } as unknown as TransactionLifecycleLogger;

    const useCase = new CreateTransactionUseCase(
      mockRepository,
      mockClientsClient,
      mockPublisher,
      mockLifecycleLogger,
    );

    await expect(
      useCase.execute({
        senderUserId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        receiverUserId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        amount: 5000,
        description: null,
        idempotencyKey: 'idem-2',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should create transaction and publish message on success', async () => {
    let createdTransaction: Transaction | null = null;
    let publishedAmountCents: string | null = null;
    const mockRepository: ITransactionRepository = {
      create: async (transaction: Transaction) => {
        createdTransaction = transaction;
      },
      findById: async () => null,
      findBySenderUserId: async () => [],
      findByReceiverUserId: async () => [],
      findByUserId: async () => [],
      findByIdempotencyKey: async () => null,
      update: async () => undefined,
      delete: async () => undefined,
    };
    const mockClientsClient: IClientsServiceClient = {
      getUserWithBankingDetails: async (userId: string) => {
        if (userId === 'sender') {
          return {
            id: userId,
            bankingDetails: {
              balanceCents: 10000n,
              accountNumber: '1',
              agency: '1',
            },
          };
        }
        if (userId === 'receiver') {
          return {
            id: userId,
            bankingDetails: {
              balanceCents: 0n,
              accountNumber: '2',
              agency: '2',
            },
          };
        }
        throw new NotFoundException('Unexpected user');
      },
    };
    const mockPublisher: IBrokerMessagePublisher = {
      publishTransactionProcess: async (message) => {
        publishedAmountCents = message.amountCents;
      },
    };
    const mockLifecycleLogger: TransactionLifecycleLogger = {
      logStatusChange: async () => undefined,
    } as unknown as TransactionLifecycleLogger;

    const useCase = new CreateTransactionUseCase(
      mockRepository,
      mockClientsClient,
      mockPublisher,
      mockLifecycleLogger,
    );

    const actual = await useCase.execute({
      senderUserId: 'sender',
      receiverUserId: 'receiver',
      amount: 5000,
      description: 'test',
      idempotencyKey: 'idem-3',
    });

    expect(createdTransaction).not.toBeNull();
    expect(actual.amount.toString()).toBe('5000');
    expect(publishedAmountCents).toBe('5000');
  });
});


