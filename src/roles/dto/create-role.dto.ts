import { IsArray, IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'Name không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Description không được để trống' })
  description: string;

  @IsNotEmpty({ message: 'isActive không được để trống' })
  isActive: boolean;

  @IsNotEmpty({ message: 'Permissions không được để trống' })
  @IsMongoId({ each: true, message: 'Permissions là ObjectId' })
  @IsArray({ message: 'Is not array' })
  permissions: mongoose.Schema.Types.ObjectId[];
}
