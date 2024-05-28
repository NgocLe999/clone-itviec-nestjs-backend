import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission, PermissionsDocument } from './schemas/permission.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private PermissionsModel: SoftDeleteModel<PermissionsDocument>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    let isExist = await this.PermissionsModel.findOne({
      apiPath: createPermissionDto.apiPath,
      method: createPermissionDto.method,
    });
    if (isExist) {
      throw new BadRequestException(
        'Permisson này đã tồn tại. Vui lòng tạo Permission khác.',
      );
    }

    let newPermission = await this.PermissionsModel.create({
      ...createPermissionDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return {
      _id: newPermission?._id,
      createdAt: newPermission?.createdAt,
    };
  }

  async findAll(currentPage: number, pageSize: number, queryString: string) {
    const { filter, population } = aqp(queryString);
    delete filter.current;
    delete filter.pageSize;

    let { sort } = aqp(queryString);
    let offset = (+currentPage - 1) * +pageSize;
    let defaultLimit = +pageSize ? +pageSize : 10;

    const totalItems = (await this.PermissionsModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit); // làm tròn

    const result = await this.PermissionsModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: pageSize, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findOne(id: string) {
    let resultPermission = await this.PermissionsModel.findOne({ _id: id });
    if (resultPermission && resultPermission.isDeleted === true) {
      return 'Job này không tồn tại trên hệ thống';
    }
    return resultPermission;
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
    user: IUser,
  ) {
    return await this.PermissionsModel.updateOne(
      { _id: id },
      {
        ...updatePermissionDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }

  async remove(id: string, user: IUser) {
    await this.PermissionsModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return await this.PermissionsModel.softDelete({ _id: id });
  }
}
