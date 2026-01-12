import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { type LoginDto, loginSchema } from '../application/dtos/login.dto';
import { LoginUseCase } from '../application/useCases/login.use-case';
import { Public } from '../common/auth/public.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

import { LoginRequestDto } from './dtos/login-request.dto';
import { LoginResponseDto } from './dtos/login-response.dto';

@Controller('api/auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Authenticate with email + password' })
  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @UsePipes(new ZodValidationPipe(loginSchema))
  public async login(@Body() data: LoginDto): Promise<LoginResponseDto> {
    return await this.loginUseCase.execute(data);
  }
}
