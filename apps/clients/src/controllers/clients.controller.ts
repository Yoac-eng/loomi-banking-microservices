import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UsePipes,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  type UpdateUserDto,
  updateUserSchema,
} from '../application/dtos/update-user.dto';
import { GetUserByIdUseCase } from '../application/useCases/get-user-by-id.use-case';
import { UpdateProfilePictureUseCase } from '../application/useCases/update-profile-picture.use-case';
import { UpdateUserUseCase } from '../application/useCases/update-user.use-case';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('api/users')
export class ClientsController {
  constructor(
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateProfilePictureUseCase: UpdateProfilePictureUseCase,
  ) {}

  @Get(':userId')
  async getUserById(@Param('userId') userId: string) {
    const user = await this.getUserByIdUseCase.execute(userId);
    return user.toJson();
  }

  @Patch(':userId')
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  async updateUser(
    @Param('userId') userId: string,
    @Body() data: UpdateUserDto,
  ) {
    const user = await this.updateUserUseCase.execute(userId, data);
    return user.toJson();
  }

  @Patch(':userId/profile-picture')
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateProfilePicture(
    @Param('userId') userId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
  ) {
    const user = await this.updateProfilePictureUseCase.execute(
      userId,
      file.buffer,
      file.mimetype,
    );

    return user.toJson();
  }
}
