import { randomUUID } from 'crypto';

import { LedgerEntryType } from '../enum/ledger-entry-type.enum';

interface LedgerEntryProps {
  bankingId: string;
  transactionId: string;
  amountCents: number;
  type: LedgerEntryType;
  createdAt: Date;
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

  get amountCents(): number {
    return this._props.amountCents;
  }

  get type(): LedgerEntryType {
    return this._props.type;
  }

  get description(): string | null {
    return this._props.description ?? null;
  }

  get createdAt(): Date {
    return this._props.createdAt;
  }

  public toJson(): Record<string, unknown> {
    return {
      id: this._id,
      ...this._props,
    };
  }
}
