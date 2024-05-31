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
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import {
  PublicPermission,
  ResponseMessage,
  User,
} from 'src/decorators/customize';
import { IUser } from 'src/users/users.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('subscribers')
@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @ResponseMessage('Create New Subscriber Successfully')
  @Post()
  create(
    @Body() createSubscriberDto: CreateSubscriberDto,
    @User() user: IUser,
  ) {
    return this.subscribersService.create(createSubscriberDto, user);
  }

  @Get()
  @ResponseMessage('Fetch All Subscribers Succesfully')
  findAll(
    @Query('current') currentPage: number,
    @Query('pageSize') pageSize: number,
    @Query() queryString: string,
  ) {
    return this.subscribersService.findAll(currentPage, pageSize, queryString);
  }

  @PublicPermission()
  @Post('skills')
  findOne(
    @User() user: IUser,
  ) {
    return this.subscribersService.findOne(user);
  }

  @ResponseMessage('Update Subscriber Successfully')
  @Patch()
  update(
    @Body() updateSubscriberDto: UpdateSubscriberDto,
    @User() user: IUser,
  ) {
    return this.subscribersService.update(updateSubscriberDto, user);
  }

  @ResponseMessage('Delete Subscriber Succesfully')
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.subscribersService.remove(id, user);
  }
}
