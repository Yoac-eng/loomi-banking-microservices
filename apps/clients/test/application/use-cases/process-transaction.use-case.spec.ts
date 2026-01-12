import { Logger } from '@nestjs/common';

import { BankingDetails } from '../../../src/domain/entities/banking-details.entity';
import { User } from '../../../src/domain/entities/user.entity';
import { AccountType } from '../../../src/domain/enum/account-type.enum';
import { LedgerEntryType } from '../../../src/domain/enum/ledger-entry-type.enum';
import type { ILedgerEntryRepository } from '../../../src/domain/interfaces/repositories/ledger-entry.repository.interface';
import type { IUserRepository } from '../../../src/domain/interfaces/repositories/user.repository.interface';
import { Amount } from '../../../src/domain/value-objects/amount.value-object';
import { Email } from '../../../src/domain/value-objects/email.value-object';
import { RabbitMQPublisher } from '../../../src/infra/messaging/rabbitmq-publisher';
import { ProcessTransactionUseCase } from '../../../src/application/useCases/process-transaction.use-case';

describe('ProcessTransactionUseCase', () => {
  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  function buildUser(params: {
    userId: string;
    email: string;
    balanceCents: number;
    bankingId: string;
    accountNumber: string;
  }): User {
    const user = new User(
      {
        fullName: 'Test',
        email: new Email(params.email),
      },
      params.userId,
    );
    const bankingDetails = new BankingDetails(
      {
        userId: params.userId,
        agency: '0001',
        accountNumber: params.accountNumber,
        accountType: AccountType.CHECKING,
        balance: Amount.create(params.balanceCents),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      params.bankingId,
    );
    user.attachBankingDetails(bankingDetails);
    return user;
  }

  it('should publish FAILED when sender has insufficient balance', async () => {
    const sender = buildUser({
      userId: 'sender',
      email: 'sender@example.com',
      balanceCents: 1000,
      bankingId: 'banking-sender',
      accountNumber: '111',
    });
    const receiver = buildUser({
      userId: 'receiver',
      email: 'receiver@example.com',
      balanceCents: 0,
      bankingId: 'banking-receiver',
      accountNumber: '222',
    });

    const mockUserRepository: IUserRepository = {
      create: async () => undefined,
      updateFinancials: async () => undefined,
      updateProfile: async () => undefined,
      findById: async () => null,
      findByEmail: async () => null,
      findByIdWithBankingDetails: async (id: string) => {
        return id === 'sender' ? sender : receiver;
      },
      delete: async () => undefined,
    };

    const mockLedgerEntryRepository: ILedgerEntryRepository = {
      create: async (entry) => entry,
      findById: async () => null,
      findByBankingId: async () => [],
      findByTransactionId: async () => null,
      findByBankingIdAndType: async () => [],
      findByBankingIdAndDateRange: async () => [],
    };

    let publishedStatus: string | null = null;
    const mockPublisher: RabbitMQPublisher = {
      publishTransactionCompleted: async (message) => {
        publishedStatus = message.status;
      },
    } as unknown as RabbitMQPublisher;

    const useCase = new ProcessTransactionUseCase(
      mockUserRepository,
      mockLedgerEntryRepository,
      mockPublisher,
    );

    await useCase.execute({
      transactionId: 'tx-1',
      senderUserId: 'sender',
      receiverUserId: 'receiver',
      amountCents: '5000',
      idempotencyKey: 'idem-1',
    });

    expect(publishedStatus).toBe('FAILED');
    expect(sender.bankingDetails.balanceCents).toBe(1000n);
  });

  it('should debit, credit, create ledger entries and publish SUCCESS', async () => {
    const sender = buildUser({
      userId: 'sender',
      email: 'sender@example.com',
      balanceCents: 10000,
      bankingId: 'banking-sender',
      accountNumber: '111',
    });
    const receiver = buildUser({
      userId: 'receiver',
      email: 'receiver@example.com',
      balanceCents: 0,
      bankingId: 'banking-receiver',
      accountNumber: '222',
    });

    let updateFinancialsCalls = 0;
    const mockUserRepository: IUserRepository = {
      create: async () => undefined,
      updateFinancials: async () => {
        updateFinancialsCalls += 1;
      },
      updateProfile: async () => undefined,
      findById: async () => null,
      findByEmail: async () => null,
      findByIdWithBankingDetails: async (id: string) => {
        return id === 'sender' ? sender : receiver;
      },
      delete: async () => undefined,
    };

    const createdLedgerTypes: LedgerEntryType[] = [];
    const mockLedgerEntryRepository: ILedgerEntryRepository = {
      create: async (entry) => {
        createdLedgerTypes.push(entry.type);
        return entry;
      },
      findById: async () => null,
      findByBankingId: async () => [],
      findByTransactionId: async () => null,
      findByBankingIdAndType: async () => [],
      findByBankingIdAndDateRange: async () => [],
    };

    let publishedStatus: string | null = null;
    const mockPublisher: RabbitMQPublisher = {
      publishTransactionCompleted: async (message) => {
        publishedStatus = message.status;
      },
    } as unknown as RabbitMQPublisher;

    const useCase = new ProcessTransactionUseCase(
      mockUserRepository,
      mockLedgerEntryRepository,
      mockPublisher,
    );

    await useCase.execute({
      transactionId: 'tx-2',
      senderUserId: 'sender',
      receiverUserId: 'receiver',
      amountCents: '5000',
      idempotencyKey: 'idem-2',
    });

    expect(updateFinancialsCalls).toBe(2);
    expect(createdLedgerTypes).toEqual([
      LedgerEntryType.DEBIT,
      LedgerEntryType.CREDIT,
    ]);
    expect(sender.bankingDetails.balanceCents).toBe(5000n);
    expect(receiver.bankingDetails.balanceCents).toBe(5000n);
    expect(publishedStatus).toBe('SUCCESS');
  });
});


