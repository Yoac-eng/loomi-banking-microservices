import { randomUUID } from 'crypto';

import { AccountType } from '../enum/account-type.enum';
import { Email } from '../value-objects/email.value-object';

import { BankingDetails } from './banking-details.entity';

interface UserProps {
  fullName: string;
  email: Email;
  passwordHash?: string | null;
  address?: string | null;
  profilePictureUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// User is the aggregate root, BankingDetails is an entity
export class User {
  private readonly _id: string;
  private readonly _props: UserProps;
  private _bankingDetails?: BankingDetails;

  constructor(props: UserProps, id?: string) {
    this._id = id ?? randomUUID();
    this._props = props;
  }

  get id(): string {
    return this._id;
  }

  get fullName(): string {
    return this._props.fullName;
  }

  get email(): Email {
    return this._props.email;
  }

  get passwordHash(): string | null {
    return this._props.passwordHash ?? null;
  }

  get address(): string | null {
    return this._props.address ?? null;
  }

  get profilePictureUrl(): string | null {
    return this._props.profilePictureUrl ?? null;
  }

  get createdAt(): Date {
    return this._props.createdAt ?? new Date();
  }

  get updatedAt(): Date {
    return this._props.updatedAt ?? new Date();
  }

  get bankingDetails(): BankingDetails {
    if (!this._bankingDetails) {
      throw new Error('Banking details not loaded in aggregate');
    }
    return this._bankingDetails;
  }

  hasBankingDetails(): boolean {
    return this._bankingDetails !== undefined;
  }

  attachBankingDetails(bankingDetails: BankingDetails): void {
    this.validateBankingDetailsOwnership(bankingDetails);
    this._bankingDetails = bankingDetails;
  }

  updateProfile(data: {
    fullName?: string;
    email?: Email;
    address?: string | null;
    profilePictureUrl?: string | null;
  }): void {
    if (data.fullName !== undefined) {
      this._props.fullName = data.fullName;
    }
    if (data.email !== undefined) {
      this._props.email = data.email;
    }
    if (data.address !== undefined) {
      this._props.address = data.address;
    }
    if (data.profilePictureUrl !== undefined) {
      this._props.profilePictureUrl = data.profilePictureUrl;
    }
    this._props.updatedAt = new Date();
  }

  updateBankingDetails(data: {
    agency?: string;
    accountNumber?: string;
    accountType?: AccountType;
  }): void {
    if (!this._bankingDetails) {
      throw new Error('Banking details not loaded in aggregate');
    }
    this._bankingDetails.updateDetails(data);
    this._props.updatedAt = new Date();
  }

  performBankingOperation(
    operation: 'credit' | 'debit',
    amountCents: number,
  ): void {
    if (!this._bankingDetails) {
      throw new Error('Banking details not loaded in aggregate');
    }
    if (operation === 'credit') {
      this._bankingDetails.credit(amountCents);
    } else {
      this._bankingDetails.debit(amountCents);
    }
    this._props.updatedAt = new Date();
  }

  private validateBankingDetailsOwnership(
    bankingDetails: BankingDetails,
  ): void {
    if (bankingDetails.userId !== this.id) {
      throw new Error('Banking details do not belong to this user aggregate');
    }
  }

  public toJson(): Record<string, unknown> {
    return {
      id: this._id,
      fullName: this._props.fullName,
      email: this._props.email.toString(),
      address: this._props.address,
      profilePictureUrl: this._props.profilePictureUrl,
      createdAt: this._props.createdAt,
      updatedAt: this._props.updatedAt,
      bankingDetails: this._bankingDetails?.toJson(),
    };
  }
}
