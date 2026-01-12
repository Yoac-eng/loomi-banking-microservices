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
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

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
import { Public } from '../common/auth/public.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

import { CreateUserRequestDto } from './dtos/create-user-request.dto';
import { UpdateProfilePictureRequestDto } from './dtos/update-profile-picture-request.dto';
import { UpdateUserRequestDto } from './dtos/update-user-request.dto';
import { UserResponseDto } from './dtos/user-response.dto';

@Controller('api/users')
@ApiTags('users')
@ApiSecurity('bearer')
export class ClientsController {
  constructor(
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateProfilePictureUseCase: UpdateProfilePictureUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create a user (with banking details)' })
  @ApiBody({ type: CreateUserRequestDto })
  @ApiCreatedResponse({ type: UserResponseDto })
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async createUser(@Body() data: CreateUserDto) {
    const user = await this.createUserUseCase.execute(data);
    return user.toJson();
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user details (including banking details)' })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiOkResponse({ type: UserResponseDto })
  async getUserById(@Param('userId', ParseUUIDPipe) userId: string) {
    const user = await this.getUserByIdUseCase.execute(userId);
    return user.toJson();
  }

  @Patch(':userId')
  @ApiOperation({ summary: 'Partially update user data' })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiBody({ type: UpdateUserRequestDto })
  @ApiOkResponse({ type: UserResponseDto })
  async updateUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body(new ZodValidationPipe(updateUserSchema)) data: UpdateUserDto,
  ) {
    const user = await this.updateUserUseCase.execute(userId, data);
    return user.toJson();
  }

  @Patch(':userId/profile-picture')
  @ApiOperation({ summary: 'Upload a new profile picture (multipart)' })
  @ApiParam({ name: 'userId', format: 'uuid' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProfilePictureRequestDto })
  @ApiOkResponse({ type: UserResponseDto })
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
