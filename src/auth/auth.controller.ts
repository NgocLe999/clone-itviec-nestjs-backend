import { Controller, Get, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage } from 'src/decorators/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // không check JWT
  @UseGuards(LocalAuthGuard)
  @Post('login') // route --> auth/login
  async handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }

  @ResponseMessage('Register New User Succesfully')
  @Public()
  @Post('register')
  create(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  
}
