import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { IUser } from 'src/users/users.interface';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subscriber.name)
    private SubscriberModel: SoftDeleteModel<SubscriberDocument>,
  ) {}

  async create(createSubscriberDto: CreateSubscriberDto, user: IUser) {
    // check email đã tồn tại hay chưa
    const isExist = await this.SubscriberModel.findOne({
      email: createSubscriberDto.email,
    });
    if (isExist) {
      throw new BadRequestException(
        'Email đã tồn tại. Vui lòng nhập email khác.',
      );
    }
    const subscriber = await this.SubscriberModel.create({
      ...createSubscriberDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return subscriber;
  }

  async findAll(currentPage: number, limit: number, queryString: string) {
    const { filter, population } = aqp(queryString);
    delete filter.current;
    delete filter.pageSize;

    let { sort } = aqp(queryString);
    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.SubscriberModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit); // làm tròn

    const result = await this.SubscriberModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
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

  async findOne(user: IUser) {
    const subscriber = await this.SubscriberModel.findOne({
      email: user.email,
    });
    return subscriber;
    // const userDataClone = user.toObject();
    // delete userDataClone.password;
  }

  async update(updateSubscriberDto: UpdateSubscriberDto, user: IUser) {
    return await this.SubscriberModel.updateOne(
      { email: user.email },
      {
        ...updateSubscriberDto,
        updatedBy: {
          _id: user._id,
          name: user.name,
        },
      },
      { upsert: true }, // nếu bản ghi đã tồn tại thì update, chưa tồn tại thì insert hay tạo mới.
    );
  }

  async remove(id: string, user: IUser) {
    await this.SubscriberModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return await this.SubscriberModel.softDelete({ _id: id });
  }
}
