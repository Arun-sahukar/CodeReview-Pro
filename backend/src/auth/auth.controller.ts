import { Controller, Post, Get, Body, Put, Param, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { email: string; name: string; password: string; role?: string }) {
    try {
      return await this.authService.register(body.email, body.name, body.password, body.role);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      return await this.authService.login(body.email, body.password);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('users')
  getUsers() {
    return this.authService.getAllUsers();
  }

  @Put('users/:id/role')
  @UseGuards(JwtAuthGuard)
  updateRole(@Param('id') id: string, @Body() body: { role: string }) {
    try {
      return this.authService.updateUserRole(id, body.role);
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }
  }
}
