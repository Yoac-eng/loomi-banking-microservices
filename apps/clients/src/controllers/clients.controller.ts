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
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  createUserSchema,
  type CreateUserDto,
} from '../application/dtos/create-user.dto';
import {
  type UpdateUserDto,
  updateUserSchema,
} from '../application/dtos/update-user.dto';
import { CreateUserUseCase } from '../application/useCases/create-user.use-case';
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
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async createUser(@Body() data: CreateUserDto) {
    const user = await this.createUserUseCase.execute(data);
    return user.toJson();
  }

  @Get(':userId')
  async getUserById(@Param('userId', ParseUUIDPipe) userId: string) {
    const user = await this.getUserByIdUseCase.execute(userId);
    return user.toJson();
  }

  @Patch(':userId')
  async updateUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body(new ZodValidationPipe(updateUserSchema)) data: UpdateUserDto,
  ) {
    const user = await this.updateUserUseCase.execute(userId, data);
    return user.toJson();
  }

  @Patch(':userId/profile-picture')
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateProfilePicture(
    @Param('userId', ParseUUIDPipe) userId: string,
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
