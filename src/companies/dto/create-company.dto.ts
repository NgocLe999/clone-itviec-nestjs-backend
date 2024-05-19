import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty({ message: 'Tên công ty không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'Địa ch này không được để trống' })
  address: string;

  @IsNotEmpty({ message: 'Description này không được để trống' })
  description: string;
}
