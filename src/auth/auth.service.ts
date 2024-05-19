import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { ResponseMessage } from 'src/decorators/customize';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Users, UsersDocument } from 'src/users/schemas/user.schema';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Users.name) private UsersModel: SoftDeleteModel<UsersDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
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

  async login(user: IUser) {
    const { _id, name, email, role } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      _id,
      name,
      email,
      role,
    };
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const registerUser = await this.UsersModel.create({
      name: registerUserDto.name,
      email: registerUserDto.email,
      password: registerUserDto.password,
      age: registerUserDto.age,
      gender: registerUserDto.gender,
      address: registerUserDto.address,
      role: 'USER'
    });
    return registerUser;
  }
}
