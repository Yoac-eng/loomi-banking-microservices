import { ApiProperty } from '@nestjs/swagger';

import { BankingDetailsDto } from './banking-details.dto';

/**
 * Swagger response DTO for a user.
 */
export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  public readonly id!: string;

  @ApiProperty({ example: 'Ada Lovelace' })
  public readonly fullName!: string;

  @ApiProperty({ example: 'ada@lovelace.dev' })
  public readonly email!: string;

  @ApiProperty({ required: false, nullable: true, example: '123 Main St' })
  public readonly address?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'https://cdn.example.com/profile.png',
  })
  public readonly profilePictureUrl?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: String,
    format: 'date-time',
  })
  public readonly createdAt?: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: String,
    format: 'date-time',
  })
  public readonly updatedAt?: string | null;

  @ApiProperty({ required: false, nullable: true, type: BankingDetailsDto })
  public readonly bankingDetails?: BankingDetailsDto | null;
}
