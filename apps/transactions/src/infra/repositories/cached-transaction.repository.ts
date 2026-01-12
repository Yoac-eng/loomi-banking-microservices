import { Inject, Injectable } from '@nestjs/common';

import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionStatus } from '../../domain/enum/transaction-status.enum';
import type { ICache } from '../../domain/interfaces/repositories/cache/cache.provider.interface';
import type { ITransactionRepository } from '../../domain/interfaces/repositories/transaction.repository.interface';
import { Amount } from '../../domain/value-objects/amount.value-object';

@Injectable()
export class CachedTransactionRepository implements ITransactionRepository {
  private readonly IDEMPOTENCY_CACHE_TTL_SECONDS = 86400; // 24 hours
  private readonly TRANSACTION_CACHE_TTL_SECONDS = 3600; // 1 hour

  constructor(
    @Inject('ITransactionRepositoryDelegate')
    private readonly delegate: ITransactionRepository,
    @Inject('ICache')
    private readonly cache: ICache,
  ) {}

  async create(transaction: Transaction): Promise<void> {
    const existingTransaction = await this.findByIdempotencyKey(
      transaction.idempotencyKey,
    );

    if (existingTransaction) {
      return;
    }

    await this.delegate.create(transaction);

    await this.cacheTransaction(transaction);
  }

  async findById(id: string): Promise<Transaction | null> {
    const cacheKey = this.getTransactionCacheKey(id);
    const cachedTransaction =
      await this.cache.get<TransactionCacheData>(cacheKey);

    if (cachedTransaction) {
      return this.deserializeTransaction(cachedTransaction);
    }

    const transaction = await this.delegate.findById(id);

    if (transaction) {
      await this.cacheTransaction(transaction);
    }

    return transaction;
  }

  async findBySenderUserId(userId: string): Promise<Transaction[]> {
    return this.delegate.findBySenderUserId(userId);
  }

  async findByReceiverUserId(userId: string): Promise<Transaction[]> {
    return this.delegate.findByReceiverUserId(userId);
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    return this.delegate.findByUserId(userId);
  }

  async findByIdempotencyKey(key: string): Promise<Transaction | null> {
    const idempotencyCacheKey = this.getIdempotencyCacheKey(key);
    const cachedTransactionId =
      await this.cache.get<string>(idempotencyCacheKey);

    if (cachedTransactionId) {
      return this.findById(cachedTransactionId);
    }

    const transaction = await this.delegate.findByIdempotencyKey(key);

    if (transaction) {
      await this.cache.set(
        idempotencyCacheKey,
        transaction.id,
        this.IDEMPOTENCY_CACHE_TTL_SECONDS,
      );
      await this.cacheTransaction(transaction);
    }

    return transaction;
  }

  async update(transaction: Transaction): Promise<void> {
    await this.delegate.update(transaction);

    await this.invalidateTransactionCache(transaction);
  }

  async delete(id: string): Promise<void> {
    const transaction = await this.delegate.findById(id);

    await this.delegate.delete(id);

    if (transaction) {
      await this.invalidateTransactionCache(transaction);
    }
  }

  private getIdempotencyCacheKey(idempotencyKey: string): string {
    return `transaction:idempotency:${idempotencyKey}`;
  }

  private getTransactionCacheKey(transactionId: string): string {
    return `transaction:${transactionId}`;
  }

  private async cacheTransaction(transaction: Transaction): Promise<void> {
    try {
      const cacheData: TransactionCacheData = {
        id: transaction.id,
        senderUserId: transaction.senderUserId,
        receiverUserId: transaction.receiverUserId,
        amountCents: transaction.amount.toString(),
        description: transaction.description,
        status: transaction.status,
        idempotencyKey: transaction.idempotencyKey,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
      };

      const transactionKey = this.getTransactionCacheKey(transaction.id);
      await this.cache.set(
        transactionKey,
        cacheData,
        this.TRANSACTION_CACHE_TTL_SECONDS,
      );

      const idempotencyKey = this.getIdempotencyCacheKey(
        transaction.idempotencyKey,
      );
      await this.cache.set(
        idempotencyKey,
        transaction.id,
        this.IDEMPOTENCY_CACHE_TTL_SECONDS,
      );
    } catch {
      // Fail silently - cache errors should not break the application
    }
  }

  private deserializeTransaction(cacheData: TransactionCacheData): Transaction {
    return new Transaction(
      {
        senderUserId: cacheData.senderUserId,
        receiverUserId: cacheData.receiverUserId,
        amount: Amount.fromString(cacheData.amountCents),
        description: cacheData.description,
        status: cacheData.status,
        idempotencyKey: cacheData.idempotencyKey,
        createdAt: new Date(cacheData.createdAt),
        updatedAt: new Date(cacheData.updatedAt),
      },
      cacheData.id,
    );
  }

  private async invalidateTransactionCache(
    transaction: Transaction,
  ): Promise<void> {
    try {
      const keys = [
        this.getTransactionCacheKey(transaction.id),
        this.getIdempotencyCacheKey(transaction.idempotencyKey),
      ];

      await Promise.all(keys.map((key) => this.cache.delete(key)));
    } catch {
      // Fail silently - cache errors should not break the application
    }
  }
}

interface TransactionCacheData {
  id: string;
  senderUserId: string;
  receiverUserId: string;
  amountCents: string;
  description: string | null;
  status: TransactionStatus;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}
