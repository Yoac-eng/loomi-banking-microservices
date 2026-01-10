import { Inject, Injectable } from '@nestjs/common';

import { BankingDetails } from '../../domain/entities/banking-details.entity';
import { User } from '../../domain/entities/user.entity';
import { AccountType } from '../../domain/enum/account-type.enum';
import type { ICache } from '../../domain/interfaces/repositories/cache/cache.provider.interface';
import type { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { Email } from '../../domain/value-objects/email.value-object';

// CachedUserRepository é um decorator que adiciona cache ao IUserRepository
@Injectable()
export class CachedUserRepository implements IUserRepository {
  private readonly CACHE_TTL_SECONDS = 3600;

  constructor(
    @Inject('IUserRepositoryDelegate')
    private readonly delegate: IUserRepository,
    @Inject('ICache')
    private readonly cache: ICache,
  ) {}

  async create(user: User): Promise<void> {
    await this.delegate.create(user);
  }

  async updateFinancials(user: User): Promise<void> {
    await this.delegate.updateFinancials(user);
    await this.invalidateUserCache(user.id, user.email.toString());
  }

  async updateProfile(user: User): Promise<void> {
    await this.delegate.updateProfile(user);
    await this.invalidateUserCache(user.id, user.email.toString());
  }

  async findById(id: string): Promise<User | null> {
    const cacheKey = this.getUserCacheKey(id);
    const cachedUser = await this.cache.get<UserCacheData>(cacheKey);

    if (cachedUser) {
      return this.deserializeUser(cachedUser);
    }

    const user = await this.delegate.findById(id);

    if (user) {
      await this.cacheUser(user, false);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const cacheKey = this.getUserEmailCacheKey(email);
    const cachedUserId = await this.cache.get<string>(cacheKey);

    if (cachedUserId) {
      return this.findById(cachedUserId);
    }

    const user = await this.delegate.findByEmail(email);

    if (user) {
      await this.cacheUser(user, false);
      await this.cache.set(cacheKey, user.id, this.CACHE_TTL_SECONDS);
    }

    return user;
  }

  async findByIdWithBankingDetails(id: string): Promise<User | null> {
    const cacheKey = this.getUserBankingCacheKey(id);
    const cachedUser = await this.cache.get<UserCacheData>(cacheKey);

    if (cachedUser && cachedUser.bankingDetails) {
      return this.deserializeUser(cachedUser);
    }

    const user = await this.delegate.findByIdWithBankingDetails(id);

    if (user) {
      await this.cacheUser(user, true);
    }

    return user;
  }

  async delete(id: string): Promise<void> {
    const user = await this.delegate.findById(id);
    const email = user?.email.toString();

    await this.delegate.delete(id);

    if (email) {
      await this.invalidateUserCache(id, email);
    }
  }

  private getUserCacheKey(userId: string): string {
    return `user:${userId}`;
  }

  private getUserEmailCacheKey(email: string): string {
    return `user:email:${email}`;
  }

  private getUserBankingCacheKey(userId: string): string {
    return `user:banking:${userId}`;
  }

  private async cacheUser(user: User, includeBanking: boolean): Promise<void> {
    try {
      const cacheData: UserCacheData = {
        id: user.id,
        fullName: user.fullName,
        email: user.email.toString(),
        address: user.address,
        profilePictureUrl: user.profilePictureUrl,
        createdAt: user.createdAt?.toISOString() ?? null,
        updatedAt: user.updatedAt?.toISOString() ?? null,
        bankingDetails:
          includeBanking && user.hasBankingDetails()
            ? {
                id: user.bankingDetails.id,
                userId: user.bankingDetails.userId,
                agency: user.bankingDetails.agency,
                accountNumber: user.bankingDetails.accountNumber,
                accountType: user.bankingDetails.accountType,
                balanceCents: user.bankingDetails.balanceCents,
                updatedAt: user.bankingDetails.updatedAt?.toISOString() ?? null,
              }
            : null,
      };

      const baseKey = this.getUserCacheKey(user.id);
      await this.cache.set(baseKey, cacheData, this.CACHE_TTL_SECONDS);

      if (includeBanking && user.hasBankingDetails()) {
        const bankingKey = this.getUserBankingCacheKey(user.id);
        await this.cache.set(bankingKey, cacheData, this.CACHE_TTL_SECONDS);
      }
    } catch {
      // Fail silently - cache errors should not break the application
    }
  }

  private deserializeUser(cacheData: UserCacheData): User {
    const user = new User(
      {
        fullName: cacheData.fullName,
        email: new Email(cacheData.email),
        address: cacheData.address,
        profilePictureUrl: cacheData.profilePictureUrl,
        createdAt: cacheData.createdAt
          ? new Date(cacheData.createdAt)
          : undefined,
        updatedAt: cacheData.updatedAt
          ? new Date(cacheData.updatedAt)
          : undefined,
      },
      cacheData.id,
    );

    if (cacheData.bankingDetails) {
      const bankingDetails = new BankingDetails(
        {
          userId: cacheData.bankingDetails.userId,
          agency: cacheData.bankingDetails.agency,
          accountNumber: cacheData.bankingDetails.accountNumber,
          accountType: cacheData.bankingDetails.accountType,
          balanceCents: cacheData.bankingDetails.balanceCents,
          updatedAt: cacheData.bankingDetails.updatedAt
            ? new Date(cacheData.bankingDetails.updatedAt)
            : undefined,
        },
        cacheData.bankingDetails.id,
      );
      user.attachBankingDetails(bankingDetails);
    }

    return user;
  }

  private async invalidateUserCache(
    userId: string,
    email: string,
  ): Promise<void> {
    try {
      const keys = [
        this.getUserCacheKey(userId),
        this.getUserEmailCacheKey(email),
        this.getUserBankingCacheKey(userId),
      ];

      await Promise.all(keys.map((key) => this.cache.delete(key)));
    } catch {
      // Fail silently - cache errors should not break the application
    }
  }
}

interface UserCacheData {
  id: string;
  fullName: string;
  email: string;
  address: string | null;
  profilePictureUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  bankingDetails: {
    id: string;
    userId: string;
    agency: string;
    accountNumber: string;
    accountType: AccountType;
    balanceCents: number;
    updatedAt: string | null;
  } | null;
}
