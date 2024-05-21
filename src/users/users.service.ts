import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Users, UsersDocument } from './schemas/user.schema';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User } from 'src/decorators/customize';
import { IUser } from './users.interface';

import aqp from 'api-query-params';
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
    // check email đã tồn tại hay chưa
    const isExist = await this.UsersModel.findOne({
      email: createUserDto.email,
    });
    if (isExist) {
      throw new BadRequestException(
        'Email đã tồn tại. Vui lòng nhập email khác.',
      );
    }
    const newUser = await this.UsersModel.create({
      ...createUserDto,
      password: hashPassword,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return newUser;
  }

  async findAll(currentPage: number, limit: number, queryString: string) {
    const { filter, population } = aqp(queryString);
    delete filter.page;

    let { sort } = aqp(queryString);
    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.UsersModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit); // làm tròn

    const result = await this.UsersModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select('-password')
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findOne(id: string) {
    //check id typeof objectId
    if (!mongoose.Types.ObjectId.isValid(id)) return 'not found user';
    const user = await this.UsersModel.findOne({ _id: id }).select('-password');
    return user;
    // const userDataClone = user.toObject();
    // delete userDataClone.password;
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
  async registerUser(registerUserDto: RegisterUserDto) {
    const { name, email, password, age, gender, address, role } =
      registerUserDto;
    // check email đã tồn tại hay chưa
    const isExist = await this.UsersModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(
        'Email đã tồn tại. Vui lòng nhập email khác.',
      );
    }
    const hashPassword = this.hassPassword(password);
    const registerUser = await this.UsersModel.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      address,
      role: 'USER',
    });
    return registerUser;
  }

  addRefreshToken = async (id: string, refresh_token: string) => {
    return await this.UsersModel.updateOne({ _id: id },{ refresh_token});
  };

  queryUserByRefreshToken = async (refresh_token:string)=>{
    return await this.UsersModel.findOne({refresh_token})
  }
}
