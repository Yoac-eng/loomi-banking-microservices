import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';

import { LedgerEntry } from '../../domain/entities/ledger-entry.entity';
import { LedgerEntryType } from '../../domain/enum/ledger-entry-type.enum';
import type { ILedgerEntryRepository } from '../../domain/interfaces/repositories/ledger-entry.repository.interface';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { Amount } from '../../domain/value-objects/amount.value-object';
import { RabbitMQPublisher } from '../../infra/messaging/rabbitmq-publisher';

interface TransactionProcessMessage {
  transactionId: string;
  senderUserId: string;
  receiverUserId: string;
  amountCents: string;
  idempotencyKey: string;
}

@Injectable()
export class ProcessTransactionUseCase {
  private readonly logger = new Logger(ProcessTransactionUseCase.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ILedgerEntryRepository')
    private readonly ledgerEntryRepository: ILedgerEntryRepository,
    private readonly rabbitmqPublisher: RabbitMQPublisher,
  ) {}

  async execute(message: TransactionProcessMessage): Promise<void> {
    try {
      const sender = await this.userRepository.findByIdWithBankingDetails(
        message.senderUserId,
      );

      if (!sender || !sender.hasBankingDetails()) {
        throw new NotFoundException(
          `Sender ${message.senderUserId} not found or has no banking details`,
        );
      }

      const receiver = await this.userRepository.findByIdWithBankingDetails(
        message.receiverUserId,
      );

      if (!receiver || !receiver.hasBankingDetails()) {
        throw new NotFoundException(
          `Receiver ${message.receiverUserId} not found or has no banking details`,
        );
      }

      const amount = Amount.fromString(message.amountCents);
      // Validate balance again (may have changed)
      if (sender.bankingDetails.balanceCents < amount.cents) {
        // publish transaction completed message with failure status
        await this.rabbitmqPublisher.publishTransactionCompleted({
          transactionId: message.transactionId,
          status: 'FAILED',
          errorMessage: 'Insufficient balance',
        });
        return;
      }

      // Process transaction
      // Debit sender
      sender.performBankingOperation('debit', amount);
      await this.userRepository.updateFinancials(sender);

      // Credit receiver
      receiver.performBankingOperation('credit', amount);
      await this.userRepository.updateFinancials(receiver);

      // Create ledger entries
      const debitEntry = new LedgerEntry({
        bankingId: sender.bankingDetails.id,
        transactionId: message.transactionId,
        amount,
        type: LedgerEntryType.DEBIT,
        description: `Transfer to ${receiver.bankingDetails.accountNumber}`,
      });
      await this.ledgerEntryRepository.create(debitEntry);

      const creditEntry = new LedgerEntry({
        bankingId: receiver.bankingDetails.id,
        transactionId: message.transactionId,
        amount,
        type: LedgerEntryType.CREDIT,
        description: `Transfer from ${sender.bankingDetails.accountNumber}`,
      });
      await this.ledgerEntryRepository.create(creditEntry);

      // Publish success
      await this.rabbitmqPublisher.publishTransactionCompleted({
        transactionId: message.transactionId,
        status: 'SUCCESS',
      });

      this.logger.log(
        `Transaction ${message.transactionId} processed successfully`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error processing transaction ${message.transactionId}: ${err.message}`,
        err.stack,
      );

      // Publish failure
      // TODO: implement rollback logic
      await this.rabbitmqPublisher.publishTransactionCompleted({
        transactionId: message.transactionId,
        status: 'FAILED',
        errorMessage: err.message,
      });
    }
  }
}
