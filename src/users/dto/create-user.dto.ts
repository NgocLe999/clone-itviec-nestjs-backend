import {
  IsEmail,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';

// validate nested object
export class Company {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;
}
export class CreateUserDto {
  @IsNotEmpty({ message: 'Name này không được để trống' })
  name: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Password này không được để trống' }) // not validate nested object
  password: string;

  @IsNotEmpty({ message: 'age này không được để trống' })
  age: string;

  @IsNotEmpty({ message: 'gender này không được để trống' })
  gender: string;

  @IsNotEmpty({ message: 'gender này không được để trống' })
  address: string;

  @IsNotEmpty({ message: 'gender này không được để trống' })
  role: string;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;
}

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Name này không được để trống' })
  name: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Password này không được để trống' }) // not validate nested object
  password: string;

  @IsNotEmpty({ message: 'Age không được để trống' })
  age: string;

  @IsNotEmpty({ message: 'gender không được để trống' })
  gender: string;

  @IsNotEmpty({ message: 'Address không được để trống' })
  address: string;

  @IsNotEmpty({ message: 'Role này không được để trống' })
  role: string;
}
