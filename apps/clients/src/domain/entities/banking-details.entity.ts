import { randomUUID } from 'crypto';

import { AccountType } from '../enum/account-type.enum';
import { Amount } from '../value-objects/amount.value-object';

interface BankingDetailsProps {
  userId: string;
  agency: string;
  accountNumber: string;
  accountType: AccountType;
  balance: Amount;
  updatedAt?: Date;
}

export class BankingDetails {
  private readonly _id: string;
  private readonly _props: BankingDetailsProps;

  constructor(props: BankingDetailsProps, id?: string) {
    this._id = id ?? randomUUID();
    this._props = props;
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._props.userId;
  }

  get agency(): string {
    return this._props.agency;
  }

  get accountNumber(): string {
    return this._props.accountNumber;
  }

  get accountType(): AccountType {
    return this._props.accountType;
  }

  get balance(): Amount {
    return this._props.balance;
  }

  get balanceCents(): bigint {
    return this._props.balance.cents;
  }

  get updatedAt(): Date {
    return this._props.updatedAt ?? new Date();
  }

  public toJson(): Record<string, unknown> {
    return {
      id: this._id,
      agency: this._props.agency,
      accountNumber: this._props.accountNumber,
      accountType: this._props.accountType,
      balanceCents: this._props.balance.toString(),
      updatedAt: this.updatedAt,
    };
  }

  credit(amount: Amount): void {
    if (amount.cents <= 0n) throw new Error('Amount must be positive');
    this._props.balance = Amount.fromRaw(
      this._props.balance.cents + amount.cents,
    );
    this._props.updatedAt = new Date();
  }

  debit(amount: Amount): void {
    if (amount.cents <= 0n) throw new Error('Amount must be positive');
    if (this._props.balance.cents < amount.cents) {
      throw new Error('Insufficient balance');
    }
    this._props.balance = Amount.fromRaw(
      this._props.balance.cents - amount.cents,
    );
    this._props.updatedAt = new Date();
  }

  updateDetails(data: {
    agency?: string;
    accountNumber?: string;
    accountType?: AccountType;
  }): void {
    if (data.agency !== undefined) {
      this._props.agency = data.agency;
    }
    if (data.accountNumber !== undefined) {
      this._props.accountNumber = data.accountNumber;
    }
    if (data.accountType !== undefined) {
      this._props.accountType = data.accountType;
    }
    this._props.updatedAt = new Date();
  }
}
