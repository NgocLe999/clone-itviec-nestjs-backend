import { IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateResumeDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'UserId không được để trống' })
  userId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'Url không được để trống' })
  url: string;

  @IsNotEmpty({ message: 'Status được để trống' })
  status: string;

  @IsNotEmpty({ message: 'company không được để trống' })
  company: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'job không được để trống' })
  job: mongoose.Schema.Types.ObjectId;
}


export class CreateResumeCvDto {
  @IsNotEmpty({ message: 'Url không được để trống' })
  url: string;

  @IsMongoId({ message: 'company is mongoId' })
  @IsNotEmpty({ message: 'company không được để trống' })
  company: mongoose.Schema.Types.ObjectId;

  @IsMongoId({ message: 'job is mongoId' })
  @IsNotEmpty({ message: 'job không được để trống' })
  job: mongoose.Schema.Types.ObjectId;
}
