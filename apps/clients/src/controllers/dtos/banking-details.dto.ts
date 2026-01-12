import { ApiProperty } from '@nestjs/swagger';

import { AccountType } from '../../domain/enum/account-type.enum';

/**
 * Swagger DTO for banking details (nested object).
 */
export class BankingDetailsDto {
  @ApiProperty({ format: 'uuid' })
  public readonly id!: string;

  @ApiProperty({ example: '0001' })
  public readonly agency!: string;

  @ApiProperty({ example: '123456-7' })
  public readonly accountNumber!: string;

  @ApiProperty({ enum: AccountType, example: AccountType.CHECKING })
  public readonly accountType!: AccountType;

  @ApiProperty({ type: Number, example: 50000 })
  public readonly balanceCents!: number;

  @ApiProperty({ type: String, format: 'date-time' })
  public readonly updatedAt!: string;
}
