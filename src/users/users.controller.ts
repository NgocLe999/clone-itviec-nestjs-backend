import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import { IUser } from './users.interface';

@Controller('users') // Xuất phát với link /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage('Created New User Succesfully')
  create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    return this.usersService.createUser(createUserDto, user);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch()
  @ResponseMessage('Update User Succesfully')
  update(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    return this.usersService.updateUser(updateUserDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete User Succesfully')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.deleteUser(id, user);
  }
}
