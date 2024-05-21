import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Users, UsersDocument } from 'src/users/schemas/user.schema';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';
import ms from 'ms';
import { Response, Request, response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users.name) private UsersModel: SoftDeleteModel<UsersDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // username và pass là 2 tham số thư viện passport ném về
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      let isValidPassword = this.usersService.isValidUserPassword(
        pass,
        user.password,
      );
      if (isValidPassword === true) {
        return user;
      }
    }
    return null;
  }

  async login(user: IUser, response: Response) {
    const { _id, name, email, role } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
    };
    const refresh_token = this.createResfreshToken(payload);

    // update user with refresh_token/// When user logout --> delete refresh token.
    await this.usersService.addRefreshToken(_id, refresh_token);

    // Clear cookies
    response.clearCookie('refresh_token');

    // Set cookies
    response.cookie('refresh_token', refresh_token, {
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE')), //milisecond
      httpOnly: true, // chỉ có server mới có thể đọc được cookies --> Tính bảo mật cookies cao hơn.
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: { _id, name, email, role },
    };
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    let newUser = await this.usersService.registerUser(registerUserDto);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
    };
  }

  createResfreshToken = (payload: any) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE')) / 1000,
    });
    return refresh_token;
  };

  processToken =  async (
    response: Response,
    refresh_token: string,
  ) => {
    try {
      // check refresh_token
      this.jwtService.verify(refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
      // Query user by refresh_token to databasse
      let user = await this.usersService.queryUserByRefreshToken(refresh_token);
      if (user) {
        // Logic trả về access token và refresh token mới
        const { _id, name, email, role } = user;
        const payload = {
          sub: 'token refresh',
          iss: 'from server',
          _id,
          name,
          email,
          role,
        };
        const refresh_token = this.createResfreshToken(payload);

        // update user with refresh_token/// When user logout --> delete refresh token.
        await this.usersService.addRefreshToken(_id.toString(), refresh_token);

        // Clear cookies
        response.clearCookie('refresh_token');

        // Set cookies
        response.cookie('refresh_token', refresh_token, {
          maxAge: ms(
            this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE'),
          ), //milisecond
          httpOnly: true, // chỉ có server mới có thể đọc được cookies --> Tính bảo mật cookies cao hơn.
        });

        return {
          access_token: this.jwtService.sign(payload),
          user: { _id, name, email, role },
        };
      } else {
        throw new BadRequestException(
          'RefreshToken đã hết hạn. Vui lòng login.',
        );
      }
    } catch (error) {
      // Trường hợp truyền sai refreshToken hoặc refreshToken hết hạn
      throw new BadRequestException('RefreshToken đã hết hạn. Vui lòng login.');
    }
  };
}
