import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';
// import { jwtConstants } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private roleService: RolesService,
  ) {
    super({
      // header bearer token truyền lên từ client đi vào đây.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  ///kết quả giải mã jwt gán vào req.user
  async validate(payload: IUser) {
    const { _id, name, email, role } = payload;
    // Cần thêm permission vào req.user để phân quyền.
    // fetch user role
    const userRole = role as unknown as { _id: string; name: string };
    const temp = (await this.roleService.findOne(userRole._id)).toObject();
    // req.user
    return {
      _id,
      name,
      email,
      role,
      permissions: temp?.permissions ?? [],
    };
  }
}
