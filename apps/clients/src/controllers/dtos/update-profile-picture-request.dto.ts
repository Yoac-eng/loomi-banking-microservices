import { ApiProperty } from '@nestjs/swagger';

/**
 * Swagger request DTO for multipart profile picture upload.
 */
export class UpdateProfilePictureRequestDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  public readonly profilePicture!: string;
}
