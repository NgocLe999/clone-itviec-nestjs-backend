import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateSubscriberDto {
  @IsNotEmpty({ message: 'email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'name không được để trống' })
  name: string;

  @IsArray({ message: 'skill là định dạng array' })
  @IsNotEmpty({ message: 'skill không được để trống' })
  @IsString({ each: true, message: 'skill là định dạng string' })
  skills: string[];
}
