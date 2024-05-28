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
import { ResumesService } from './resumes.service';
import { CreateResumeCvDto, CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import { IUser } from 'src/users/users.interface';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @ResponseMessage('Create Resume Successfully')
  @Post()
  create(@Body() createResumeCvDto: CreateResumeCvDto, @User() user: IUser) {
    return this.resumesService.create(createResumeCvDto, user);
  }

  @ResponseMessage('Get Resume By User Successfully')
  @Post('by-user')
  handleGetResumeByUser(@User() user: IUser) {
    return this.resumesService.getResumeByUser(user);
  }

  @Public()
  @Get()
  @ResponseMessage('Fetch list resumes paginate succesfully') // custom decorators
  findAll(
    @Query('current') currentPage: number,
    @Query('pageSize') pageSize: number,
    @Query() queryString: string,
  ) {
    return this.resumesService.findAll(currentPage, pageSize, queryString);
  }

  @ResponseMessage('Get a resume succesfully')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @ResponseMessage(' Update status resume')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body('status') status: string,
    @User() user: IUser,
  ) {
    return this.resumesService.update(id, status, user);
  }

  @ResponseMessage(' Delete Resume succesfully')
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.remove(id, user);
  }
}
