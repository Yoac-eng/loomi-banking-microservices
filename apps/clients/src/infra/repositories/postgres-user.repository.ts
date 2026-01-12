import { Injectable } from '@nestjs/common';

import { BankingDetails } from '../../domain/entities/banking-details.entity';
import { User } from '../../domain/entities/user.entity';
import { AccountType } from '../../domain/enum/account-type.enum';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { Email } from '../../domain/value-objects/email.value-object';
import { prisma } from '../lib/prisma';

@Injectable()
export class PostgresUserRepository implements IUserRepository {
  async create(user: User): Promise<void> {
    const data = this.mapToPrismaData(user);

    await prisma.user.create({
      data: {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        passwordHash: data.passwordHash ?? undefined,
        address: data.address ?? undefined,
        profilePictureUrl: data.profilePictureUrl ?? undefined,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        bankingDetails: user.hasBankingDetails()
          ? { create: this.mapToPrismaBankingData(user.bankingDetails) }
          : undefined,
      },
    });
  }

  async updateFinancials(user: User): Promise<void> {
    const data = this.mapToPrismaData(user);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: data.fullName,
        email: data.email,
        address: data.address ?? undefined,
        profilePictureUrl: data.profilePictureUrl ?? undefined,
        updatedAt: data.updatedAt,
        bankingDetails: user.hasBankingDetails()
          ? {
              update: {
                ...this.mapToPrismaBankingData(user.bankingDetails),
                updatedAt: data.updatedAt,
              },
            }
          : undefined,
      },
    });
  }

  async updateProfile(user: User): Promise<void> {
    const data = this.mapToPrismaData(user);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: data.fullName,
        email: data.email,
        address: data.address,
        profilePictureUrl: data.profilePictureUrl,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user ? this.toDomainEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user ? this.toDomainEntity(user) : null;
  }

  async findByIdWithBankingDetails(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { bankingDetails: true },
    });

    return user ? this.toDomainEntityWithBankingDetails(user) : null;
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  private toDomainEntity(prismaUser: {
    id: string;
    fullName: string;
    email: string;
    passwordHash: string | null;
    address: string | null;
    profilePictureUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      {
        fullName: prismaUser.fullName,
        email: new Email(prismaUser.email),
        passwordHash: prismaUser.passwordHash,
        address: prismaUser.address,
        profilePictureUrl: prismaUser.profilePictureUrl,
        createdAt: prismaUser.createdAt,
        updatedAt: prismaUser.updatedAt,
      },
      prismaUser.id,
    );
  }

  private toDomainEntityWithBankingDetails(prismaUser: {
    id: string;
    fullName: string;
    email: string;
    passwordHash: string | null;
    address: string | null;
    profilePictureUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    bankingDetails: {
      id: string;
      userId: string;
      agency: string;
      accountNumber: string;
      accountType: 'CHECKING' | 'SAVINGS';
      balanceCents: number;
      updatedAt: Date;
    } | null;
  }): User {
    const user = this.toDomainEntity(prismaUser);
    if (prismaUser.bankingDetails) {
      const bd = new BankingDetails(
        {
          userId: prismaUser.bankingDetails.userId,
          agency: prismaUser.bankingDetails.agency,
          accountNumber: prismaUser.bankingDetails.accountNumber,
          accountType:
            prismaUser.bankingDetails.accountType === 'CHECKING'
              ? AccountType.CHECKING
              : AccountType.SAVINGS,
          balanceCents: prismaUser.bankingDetails.balanceCents,
          updatedAt: prismaUser.bankingDetails.updatedAt,
        },
        prismaUser.bankingDetails.id,
      );
      user.attachBankingDetails(bd);
    }
    return user;
  }

  private mapToPrismaData(user: User) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email.toString(),
      passwordHash: user.passwordHash,
      address: user.address,
      profilePictureUrl: user.profilePictureUrl,
      updatedAt: user.updatedAt,
      createdAt: user.createdAt,
    };
  }

  private mapToPrismaBankingData(bd: BankingDetails) {
    return {
      id: bd.id,
      agency: bd.agency,
      accountNumber: bd.accountNumber,
      accountType: bd.accountType,
      balanceCents: bd.balanceCents,
      updatedAt: bd.updatedAt,
    };
  }
}
