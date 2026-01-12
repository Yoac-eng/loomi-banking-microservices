import { ApiProperty } from '@nestjs/swagger';

/**
 * Swagger response DTO for login.
 */
export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token. Use it as: Authorization: Bearer <token>',
  })
  public readonly accessToken!: string;

  @ApiProperty({
    type: Number,
    example: 3600,
    description: 'Token TTL in seconds.',
  })
  public readonly expiresIn!: number;
}
