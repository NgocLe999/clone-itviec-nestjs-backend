import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import { IUser } from './users.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users') // Xuất phát với link /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage('Created New User Succesfully')
  async create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    let newUser = await this.usersService.createUser(createUserDto, user);
    return {
      _id: newUser._id,
      createdAt: newUser?.createdAt,
    };
  }

  @Get()
  @ResponseMessage('Fetch All User Succesfully')
  findAll(
    @Query('current') currentPage: number,
    @Query('pageSize') limit: number,
    @Query() queryString: string,
  ) {
    return this.usersService.findAll(currentPage, limit, queryString);
  }

  @Public()
  @Get(':id')
  @ResponseMessage('Fetch User By Id Succesfully')
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
