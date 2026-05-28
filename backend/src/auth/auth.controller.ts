import { Controller, Post, Body, Get, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    const { email, password } = body;
    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password combination');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: any) {
    const { name, email, password, timezone } = body;
    if (!name || !email || !password) {
      throw new UnauthorizedException('Name, email, and password are required');
    }
    return this.authService.register({ name, email, pass: password, timezone });
  }

  @Post('refresh')
  async refresh(@Body() body: any) {
    const { refresh_token } = body;
    if (!refresh_token) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return this.authService.refresh(refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    return this.authService.logout(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: any) {
    return req.user;
  }
}
