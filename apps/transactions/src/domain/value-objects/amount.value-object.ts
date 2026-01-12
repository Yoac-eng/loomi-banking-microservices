// value object to centralize amount logic
export class Amount {
  private readonly value: bigint;

  private constructor(value: bigint) {
    this.value = value;
    Object.freeze(this);
  }

  public static create(value: number): Amount {
    if (!Number.isInteger(value)) {
      throw new Error('Amount must be an integer (cents)');
    }
    if (value < 0) {
      throw new Error('Amount cannot be negative');
    }
    return new Amount(BigInt(value));
  }

  public static fromRaw(value: bigint): Amount {
    if (value < 0n) {
      throw new Error('Amount cannot be negative');
    }
    return new Amount(value);
  }

  public static fromString(value: string): Amount {
    return Amount.fromRaw(BigInt(value));
  }

  public toRaw(): bigint {
    return this.value;
  }

  public toString(): string {
    return this.value.toString();
  }

  get cents(): bigint {
    return this.value;
  }
}
