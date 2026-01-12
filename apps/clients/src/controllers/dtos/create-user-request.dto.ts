import { ApiProperty } from '@nestjs/swagger';

import { AccountType } from '../../domain/enum/account-type.enum';

/**
 * Swagger request DTO for creating a user.
 */
export class CreateUserRequestDto {
  @ApiProperty({ example: 'Ada Lovelace' })
  public readonly fullName!: string;

  @ApiProperty({ example: 'ada@lovelace.dev' })
  public readonly email!: string;

  @ApiProperty({
    minLength: 8,
    example: 'ChangeMe123!',
    description: 'Plain-text password; will be stored as a hash.',
  })
  public readonly password!: string;

  @ApiProperty({ required: false, nullable: true, example: '123 Main St' })
  public readonly address?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'https://cdn.example.com/profile.png',
  })
  public readonly profilePictureUrl?: string | null;

  @ApiProperty({
    type: Object,
    example: {
      agency: '0001',
      accountNumber: '123456-7',
      accountType: 'CHECKING',
      initialBalance: 10000,
    },
    description:
      'Banking details. initialBalance is optional (defaults to 0, in cents).',
  })
  public readonly bankingDetails!: {
    agency: string;
    accountNumber: string;
    accountType: AccountType;
    initialBalance?: number;
  };
}
