import { randomUUID } from 'crypto';

import { AccountType } from '../enum/account-type.enum';

interface BankingDetailsProps {
  userId: string;
  agency: string;
  accountNumber: string;
  accountType: AccountType;
  balanceCents: number;
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

  get balanceCents(): number {
    return this._props.balanceCents;
  }

  get updatedAt(): Date {
    return this._props.updatedAt ?? new Date();
  }

  public toJson(): Record<string, unknown> {
    return {
      id: this._id,
      ...this._props,
    };
  }

  credit(amountCents: number): void {
    if (amountCents <= 0) throw new Error('Amount must be positive');

    this._props.balanceCents += amountCents;
    this._props.updatedAt = new Date();
  }

  debit(amountCents: number): void {
    if (amountCents <= 0) throw new Error('Amount must be positive');

    if (this._props.balanceCents < amountCents) {
      throw new Error('Insufficient balance');
    }
    this._props.balanceCents -= amountCents;
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
