import {
  Controller,
  Get,
  Post,
  UseGuards,
  Body,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { IUser } from 'src/users/users.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // không check JWT
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Login Succesfully')
  @Post('login') // route --> auth/login
  async handleLogin(
    @Req() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(req.user, response);
  }

  @ResponseMessage('Register New User Succesfully')
  @Public()
  @Post('register')
  create(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  // Client - Bearer Token (Access Token) - JwtStrategy - Decode - Bind (req.user) - @User// Trường hợp access_token còn hạn.
  @ResponseMessage('Get User Succesfully')
  @Get('account')
  handleGetUser(@User() user: IUser) {
    return { user };
  }

  // Trường hợp access_token hết hạn.
  @Public()
  @ResponseMessage('Fresh User Succesfully')
  @Get('refresh')
  handleRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refresh_token = request.cookies['refresh_token'];
    return this.authService.processToken(response, refresh_token);
  }

  // Logout {Remove cookies & Reset refresh_token user = null || ''}
  @ResponseMessage('Logout Succesfully')
  @Post('logout') 
  async handleLogout(
    @Res({ passthrough: true }) response: Response,
    @User() user: IUser,
  ) {
    return this.authService.logout(user, response);
  }
}
