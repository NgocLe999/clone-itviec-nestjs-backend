import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Users, UsersDocument } from './schemas/user.schema';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User } from 'src/decorators/customize';
import { IUser } from './users.interface';
import { IsNumberOptions } from 'class-validator';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private UsersModel: SoftDeleteModel<UsersDocument>,
  ) {}

  hassPassword = (password: string) => {
    var salt = genSaltSync(10);
    var hashPassword = hashSync(password, salt);
    return hashPassword;
  };

  async createUser(createUserDto: CreateUserDto, user: IUser) {
    const hashPassword = this.hassPassword(createUserDto.password);
    const newUser = await this.UsersModel.create({
      ...createUserDto,
      createdBy: {
        _id: user._id,
        name: user.name,
      },
    });
    return newUser;
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    //check id typeof objectId
    if (!mongoose.Types.ObjectId.isValid(id)) return 'not found user';
    const user = await this.UsersModel.findOne({ _id: id });
    return user;
  }
  async findOneByUsername(username: string) {
    const user = await this.UsersModel.findOne({ email: username });
    return user;
  }
  // check password
  isValidUserPassword(password: string, hash: string) {
    let isValid = compareSync(password, hash);
    return isValid;
  }

  async updateUser(updateUserDto: UpdateUserDto, user: IUser) {
    return await this.UsersModel.updateOne(
      { _id: updateUserDto._id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          name: user.name,
        },
      },
    );
  }

  async deleteUser(id: string, user: IUser) {
   
    await this.UsersModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          name: user.name,
        },
      },
    );
    const userDeleted = await this.UsersModel.softDelete({ _id: id });
    return userDeleted;
  }
}
