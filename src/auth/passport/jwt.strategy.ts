import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/users/users.interface';
// import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // header bearer token truyền lên từ client đi vào đây.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SCRET'),
    });
  }

  ///kết quả giải mã jwt gán vào req.user
  async validate(payload: IUser) {
    const { _id, name, email, role } = payload;
    return {
      _id,
      name,
      email,
      role,
    };
  }
}
