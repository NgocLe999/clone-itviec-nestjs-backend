import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Users } from './schemas/user.schema';
import { genSaltSync, hashSync } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(Users.name) private UsersModel: Model<Users>) {}

  hassPassword = (password: string) => {
    var salt = genSaltSync(10);
    var hashPassword = hashSync(password, salt);
    return hashPassword;
  };

  async create(createUserDto: CreateUserDto) {
    const hashPassword = this.hassPassword(createUserDto.password);
    const createdUser = await this.UsersModel.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashPassword,
      city: createUserDto.city,
    });
    return createdUser;
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

  async update(updateUserDto: UpdateUserDto) {
    return await this.UsersModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto },
    );
  }

  async remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'not found user';
    const user = await this.UsersModel.deleteOne({ _id: id });
    return user;
  }
}
