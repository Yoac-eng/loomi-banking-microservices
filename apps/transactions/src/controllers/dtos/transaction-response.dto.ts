import { ApiProperty } from '@nestjs/swagger';

import { TransactionStatus } from '../../domain/enum/transaction-status.enum';

/**
 * Swagger response DTO for a transaction.
 * Mirrors `Transaction.toJson()` shape.
 */
export class TransactionResponseDto {
  @ApiProperty({ format: 'uuid' })
  public readonly id!: string;

  @ApiProperty({ format: 'uuid' })
  public readonly senderUserId!: string;

  @ApiProperty({ format: 'uuid' })
  public readonly receiverUserId!: string;

  @ApiProperty({ type: Number, example: 1500 })
  public readonly amountCents!: number;

  @ApiProperty({ type: String, required: false, nullable: true })
  public readonly description?: string | null;

  @ApiProperty({ enum: TransactionStatus, example: TransactionStatus.PENDING })
  public readonly status!: TransactionStatus;

  @ApiProperty({ type: String, example: 'idem-2026-01-11T12:00:00Z-abc123' })
  public readonly idempotencyKey!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  public readonly createdAt!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  public readonly updatedAt!: string;
}
