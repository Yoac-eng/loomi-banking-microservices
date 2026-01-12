import { ApiProperty } from '@nestjs/swagger';

/**
 * Swagger request DTO for login.
 */
export class LoginRequestDto {
  @ApiProperty({ example: 'joao@example.com' })
  public readonly email!: string;

  @ApiProperty({ example: 'password123' })
  public readonly password!: string;
}
