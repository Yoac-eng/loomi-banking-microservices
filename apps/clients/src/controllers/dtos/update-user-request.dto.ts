import { ApiProperty } from '@nestjs/swagger';

import { AccountType } from '../../domain/enum/account-type.enum';

/**
 * Swagger request DTO for partial user update.
 */
export class UpdateUserRequestDto {
  @ApiProperty({ required: false, example: 'Ada Lovelace' })
  public readonly fullName?: string;

  @ApiProperty({ required: false, example: 'ada@lovelace.dev' })
  public readonly email?: string;

  @ApiProperty({ required: false, nullable: true, example: '123 Main St' })
  public readonly address?: string | null;

  @ApiProperty({
    required: false,
    type: Object,
    example: {
      agency: '0001',
      accountNumber: '123456-7',
      accountType: 'CHECKING',
    },
  })
  public readonly bankingDetails?: {
    agency?: string;
    accountNumber?: string;
    accountType?: AccountType;
  };
}
