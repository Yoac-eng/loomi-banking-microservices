import { ApiProperty } from '@nestjs/swagger';

/**
 * Swagger request DTO for creating a transaction.
 */
export class CreateTransactionRequestDto {
  @ApiProperty({
    format: 'uuid',
    example: '2f1b5e1c-3a5d-4e8d-8b9a-0f2d3c4b5a6e',
  })
  public readonly senderUserId!: string;

  @ApiProperty({
    format: 'uuid',
    example: '7c6d5e4f-3b2a-1c0d-9e8f-7a6b5c4d3e2f',
  })
  public readonly receiverUserId!: string;

  @ApiProperty({
    type: Number,
    example: 1500,
    description: 'Amount in cents (integer, positive).',
  })
  public readonly amount!: number;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
    example: 'Lunch split',
  })
  public readonly description?: string | null;

  @ApiProperty({
    type: String,
    example: 'idem-2026-01-11T12:00:00Z-abc123',
    description: 'Idempotency key (client-generated).',
  })
  public readonly idempotencyKey!: string;
}
