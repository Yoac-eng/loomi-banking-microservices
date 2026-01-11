import { Injectable } from '@nestjs/common';

import { TransactionLifecycleLog } from '../../domain/entities/transaction-lifecycle-log.entity';
import { TransactionStatus } from '../../domain/enum/transaction-status.enum';
import type { ITransactionLifecycleLogRepository } from '../../domain/interfaces/repositories/transaction-lifecycle-log.repository.interface';
import { prisma } from '../lib/prisma';

@Injectable()
export class PostgresTransactionLifecycleLogRepository implements ITransactionLifecycleLogRepository {
  async create(log: TransactionLifecycleLog): Promise<void> {
    const data = this.mapToPrismaData(log);

    await prisma.transactionLifecycleLog.create({
      data,
    });
  }

  async findByTransactionId(
    transactionId: string,
  ): Promise<TransactionLifecycleLog[]> {
    const logs = await prisma.transactionLifecycleLog.findMany({
      where: { transactionId },
      orderBy: { createdAt: 'asc' },
    });

    return logs.map((log) => this.toDomainEntity(log));
  }

  async findById(id: string): Promise<TransactionLifecycleLog | null> {
    const log = await prisma.transactionLifecycleLog.findUnique({
      where: { id },
    });

    return log ? this.toDomainEntity(log) : null;
  }

  private toDomainEntity(prismaLog: {
    id: string;
    transactionId: string;
    oldStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELED' | null;
    newStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELED';
    message: string | null;
    createdAt: Date;
  }): TransactionLifecycleLog {
    return new TransactionLifecycleLog(
      {
        transactionId: prismaLog.transactionId,
        oldStatus: prismaLog.oldStatus
          ? this.mapPrismaStatusToDomain(prismaLog.oldStatus)
          : null,
        newStatus: this.mapPrismaStatusToDomain(prismaLog.newStatus),
        message: prismaLog.message,
        createdAt: prismaLog.createdAt,
      },
      prismaLog.id,
    );
  }

  private mapToPrismaData(log: TransactionLifecycleLog) {
    return {
      id: log.id,
      transactionId: log.transactionId,
      oldStatus: log.oldStatus
        ? this.mapDomainStatusToPrisma(log.oldStatus)
        : null,
      newStatus: this.mapDomainStatusToPrisma(log.newStatus),
      message: log.message ?? undefined,
      createdAt: log.createdAt,
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
