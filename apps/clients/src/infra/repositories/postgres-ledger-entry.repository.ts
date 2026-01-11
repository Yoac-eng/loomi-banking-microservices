import { Injectable } from '@nestjs/common';

import { LedgerEntry } from '../../domain/entities/ledger-entry.entity';
import { LedgerEntryType } from '../../domain/enum/ledger-entry-type.enum';
import type { ILedgerEntryRepository } from '../../domain/interfaces/repositories/ledger-entry.repository.interface';
import { prisma } from '../lib/prisma';

@Injectable()
export class PostgresLedgerEntryRepository implements ILedgerEntryRepository {
  async create(ledgerEntry: LedgerEntry): Promise<LedgerEntry> {
    const data = this.mapToPrismaData(ledgerEntry);

    const created = await prisma.ledgerEntry.create({ data });

    return this.toDomainEntity(created);
  }

  async findById(id: string): Promise<LedgerEntry | null> {
    const entry = await prisma.ledgerEntry.findUnique({
      where: { id },
    });

    return entry ? this.toDomainEntity(entry) : null;
  }

  async findByBankingId(bankingId: string): Promise<LedgerEntry[]> {
    const entries = await prisma.ledgerEntry.findMany({
      where: { bankingId },
      orderBy: { createdAt: 'desc' },
    });

    return entries.map((e) => this.toDomainEntity(e));
  }

  async findByTransactionId(
    transactionId: string,
  ): Promise<LedgerEntry | null> {
    const entry = await prisma.ledgerEntry.findFirst({
      where: { transactionId },
    });

    return entry ? this.toDomainEntity(entry) : null;
  }

  async findByBankingIdAndType(
    bankingId: string,
    type: LedgerEntryType,
  ): Promise<LedgerEntry[]> {
    const entries = await prisma.ledgerEntry.findMany({
      where: {
        bankingId,
        type: type === LedgerEntryType.CREDIT ? 'CREDIT' : 'DEBIT',
      },
      orderBy: { createdAt: 'desc' },
    });

    return entries.map((e) => this.toDomainEntity(e));
  }

  async findByBankingIdAndDateRange(
    bankingId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<LedgerEntry[]> {
    const entries = await prisma.ledgerEntry.findMany({
      where: {
        bankingId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return entries.map((e) => this.toDomainEntity(e));
  }

  private toDomainEntity(prismaEntry: {
    id: string;
    bankingId: string;
    transactionId: string;
    amountCents: number;
    type: 'CREDIT' | 'DEBIT';
    description: string | null;
    createdAt: Date;
  }): LedgerEntry {
    return new LedgerEntry(
      {
        bankingId: prismaEntry.bankingId,
        transactionId: prismaEntry.transactionId,
        amountCents: prismaEntry.amountCents,
        type:
          prismaEntry.type === 'CREDIT'
            ? LedgerEntryType.CREDIT
            : LedgerEntryType.DEBIT,
        description: prismaEntry.description,
        createdAt: prismaEntry.createdAt,
      },
      prismaEntry.id,
    );
  }

  private mapToPrismaData(ledgerEntry: LedgerEntry) {
    return {
      id: ledgerEntry.id,
      bankingId: ledgerEntry.bankingId,
      transactionId: ledgerEntry.transactionId,
      amountCents: ledgerEntry.amountCents,
      type: ledgerEntry.type,
      description: ledgerEntry.description ?? undefined,
      createdAt: ledgerEntry.createdAt,
    };
  }
}
