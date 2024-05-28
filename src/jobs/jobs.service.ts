import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Jobs, JobsDocument } from './schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Jobs.name) private JobsModel: SoftDeleteModel<JobsDocument>,
  ) {}

  async create(createJobDto: CreateJobDto, user: IUser) {


    let newJob = await this.JobsModel.create({
      ...createJobDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return {
      _id: newJob?._id,
      createdAt: newJob?.createdAt,
    };
  }

  async findAll(currentPage: number, pageSize: number, queryString: string) {
    const { filter, population } = aqp(queryString);
    delete filter.current;
    delete filter.pageSize;

    let { sort } = aqp(queryString);
    let offset = (+currentPage - 1) * +pageSize;
    let defaultLimit = +pageSize ? +pageSize : 10;

    const totalItems = (await this.JobsModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit); // làm tròn

    const result = await this.JobsModel.find(filter)
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
    let resultJob = await this.JobsModel.findOne({ _id: id });
    if (resultJob && resultJob.isDeleted === true) {
      return 'Job này không tồn tại trên hệ thống';
    }
    return resultJob;

  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    let updatedJob = await this.JobsModel.updateOne(
      { _id: id },
      {
        ...updateJobDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return updatedJob;
  }

  async remove(id: string, user: IUser) {
    await this.JobsModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return await this.JobsModel.softDelete({ _id: id });
  }
}
