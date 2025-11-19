import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { RateLimit, RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { AuthService } from '../service/auth.service';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../../user/dtos/create-user.dto';
import { Public } from '../decorators/public.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { type Response } from 'express';
import { env } from '../../config/env';
import { type AuthUser, CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  @UseGuards(RateLimitGuard)
  @RateLimit(3, 3600) // 3 signups per hour per IP
  async signup(@Body() dto: CreateUserDto) {
    return this.authService.signup(dto);
  }

  @Public()
  @Post('login')
  @UseGuards(RateLimitGuard)
  @RateLimit(5, 30) // 5 login attempts per 30 seconds per IP
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { access_token } = await this.authService.login(dto);

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    return { message: 'Login successful' };
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { message: 'Logout successful' };
  }

  @Get('me')
  getMe(@CurrentUser() user: AuthUser) {
    return user;
  }
}
