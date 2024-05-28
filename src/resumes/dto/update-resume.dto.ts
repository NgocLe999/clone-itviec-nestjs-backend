import { PartialType } from '@nestjs/mapped-types';
import { CreateResumeDto } from './create-resume.dto';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';
import { Type } from 'class-transformer';

class History {
  @IsNotEmpty()
  status: string;

  @IsNotEmpty()
  updatedAt: Date;

  @IsNotEmpty()
  updatedBy: { _id: mongoose.Schema.Types.ObjectId; email: string };
}
export class UpdateResumeDto extends PartialType(CreateResumeDto) {
  @IsNotEmpty({ message: 'history không được để trống' })
  @IsArray({ message: 'history is array' })
  @ValidateNested()
  @Type(() => History)
  history: History[];
}
