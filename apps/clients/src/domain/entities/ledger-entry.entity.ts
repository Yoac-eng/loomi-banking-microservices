import { randomUUID } from 'crypto';

import { LedgerEntryType } from '../enum/ledger-entry-type.enum';
import { Amount } from '../value-objects/amount.value-object';

interface LedgerEntryProps {
  bankingId: string;
  transactionId: string;
  amount: Amount;
  type: LedgerEntryType;
  createdAt?: Date;
  description?: string | null;
}

export class LedgerEntry {
  private readonly _id: string;
  private readonly _props: LedgerEntryProps;

  constructor(props: LedgerEntryProps, id?: string) {
    this._id = id ?? randomUUID();
    this._props = props;
  }

  get id(): string {
    return this._id;
  }

  get bankingId(): string {
    return this._props.bankingId;
  }

  get transactionId(): string {
    return this._props.transactionId;
  }

  get amount(): Amount {
    return this._props.amount;
  }

  get type(): LedgerEntryType {
    return this._props.type;
  }

  get description(): string | null {
    return this._props.description ?? null;
  }

  get createdAt(): Date {
    return this._props.createdAt ?? new Date();
  }

  public toJson(): Record<string, unknown> {
    return {
      id: this._id,
      bankingId: this._props.bankingId,
      transactionId: this._props.transactionId,
      amountCents: this._props.amount.toString(),
      type: this._props.type,
      description: this._props.description,
      createdAt: this.createdAt,
    };
  }
}
