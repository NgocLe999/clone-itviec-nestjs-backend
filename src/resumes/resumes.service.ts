import { Injectable } from '@nestjs/common';
import { CreateResumeCvDto, CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { use } from 'passport';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private ResumeModel: SoftDeleteModel<ResumeDocument>,
  ) {}

  async create(createResumeCvDto: CreateResumeCvDto, user: IUser) {
    let newResume = await this.ResumeModel.create({
      ...createResumeCvDto,
      email: user.email,
      userId: user._id,
      status: 'PENDING',
      history: [
        {
          status: 'PENDING',
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
          createdAt: new Date(),
        },
      ],
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return {
      _id: newResume?._id,
      createdAt: newResume?.createdAt,
    };
  }

  getResumeByUser = async (user: IUser) => {
    if (!mongoose.Types.ObjectId.isValid(user._id)) return 'not found company';
    return await this.ResumeModel.findOne({ userId: user._id })
      .sort('-createdAt')
      .populate([
        {
          path: 'company',
          select: { name: 1 },
        },
        {
          path: 'job',
          select: { name: 1 },
        },
      ]);
  };

  async findAll(currentPage: number, limit: number, queryString: string) {
    const { filter, population, projection } = aqp(queryString);
    delete filter.current;
    delete filter.pageSize;

    let { sort } = aqp(queryString);
    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.ResumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit); // làm tròn

    const result = await this.ResumeModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection)
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
    if (!mongoose.Types.ObjectId.isValid(id)) return 'not found company';
    const company = await this.ResumeModel.findOne({ _id: id });
    return company;
  }

  async update(id: string, status: string, user: IUser) {
    let newUpdate = {
      status: status,
      updatedAt: new Date(),
      updatedBy: {
        _id: user._id,
        email: user.email,
      },
    };
    return await this.ResumeModel.updateOne(
      { _id: id },
      {
        status: status,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
        $push: {
          history: newUpdate,
        },
      },
    );
  }

  async remove(id: string, user: IUser) {
    await this.ResumeModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    const resumeDelete = await this.ResumeModel.softDelete({ _id: id });
    return resumeDelete;
  }
}
