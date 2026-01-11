import { Injectable } from '@nestjs/common';

import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionStatus } from '../../domain/enum/transaction-status.enum';
import type { ITransactionRepository } from '../../domain/interfaces/repositories/transaction.repository.interface';
import { prisma } from '../lib/prisma';

@Injectable()
export class PostgresTransactionRepository implements ITransactionRepository {
  async create(transaction: Transaction): Promise<void> {
    const data = this.mapToPrismaData(transaction);

    await prisma.transaction.create({
      data,
    });
  }

  async findById(id: string): Promise<Transaction | null> {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    return transaction ? this.toDomainEntity(transaction) : null;
  }

  async findBySenderUserId(userId: string): Promise<Transaction[]> {
    const transactions = await prisma.transaction.findMany({
      where: { senderUserId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((t) => this.toDomainEntity(t));
  }

  async findByReceiverUserId(userId: string): Promise<Transaction[]> {
    const transactions = await prisma.transaction.findMany({
      where: { receiverUserId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((t) => this.toDomainEntity(t));
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ senderUserId: userId }, { receiverUserId: userId }],
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((t) => this.toDomainEntity(t));
  }

  async findByIdempotencyKey(key: string): Promise<Transaction | null> {
    const transaction = await prisma.transaction.findUnique({
      where: { idempotencyKey: key },
    });

    return transaction ? this.toDomainEntity(transaction) : null;
  }

  async update(transaction: Transaction): Promise<void> {
    const data = this.mapToPrismaData(transaction);

    await prisma.transaction.update({
      where: { id: transaction.id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.transaction.delete({
      where: { id },
    });
  }

  private toDomainEntity(prismaTransaction: {
    id: string;
    senderUserId: string;
    receiverUserId: string;
    amountCents: number;
    description: string | null;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELED';
    idempotencyKey: string;
    createdAt: Date;
    updatedAt: Date;
  }): Transaction {
    return new Transaction(
      {
        senderUserId: prismaTransaction.senderUserId,
        receiverUserId: prismaTransaction.receiverUserId,
        amountCents: prismaTransaction.amountCents,
        description: prismaTransaction.description,
        status: this.mapPrismaStatusToDomain(prismaTransaction.status),
        idempotencyKey: prismaTransaction.idempotencyKey,
        createdAt: prismaTransaction.createdAt,
        updatedAt: prismaTransaction.updatedAt,
      },
      prismaTransaction.id,
    );
  }

  private mapToPrismaData(transaction: Transaction) {
    return {
      id: transaction.id,
      senderUserId: transaction.senderUserId,
      receiverUserId: transaction.receiverUserId,
      amountCents: transaction.amountCents,
      description: transaction.description ?? undefined,
      status: this.mapDomainStatusToPrisma(transaction.status),
      idempotencyKey: transaction.idempotencyKey,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  private mapPrismaStatusToDomain(
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELED',
  ): TransactionStatus {
    switch (status) {
      case 'PENDING':
        return TransactionStatus.PENDING;
      case 'SUCCESS':
        return TransactionStatus.SUCCESS;
      case 'FAILED':
        return TransactionStatus.FAILED;
      case 'CANCELED':
        return TransactionStatus.CANCELED;
      default:
        return TransactionStatus.PENDING;
    }
  }

  private mapDomainStatusToPrisma(
    status: TransactionStatus,
  ): 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELED' {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'PENDING';
      case TransactionStatus.SUCCESS:
        return 'SUCCESS';
      case TransactionStatus.FAILED:
        return 'FAILED';
      case TransactionStatus.CANCELED:
        return 'CANCELED';
    }
  }
}
