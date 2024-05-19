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
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ResponseMessage, User } from 'src/decorators/customize';
import { IUser } from 'src/users/users.interface';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  // passing user
  @Post()
  @ResponseMessage('Company Created Succesfully')
  create(@Body() createCompanyDto: CreateCompanyDto, @User() user: IUser) {
    return this.companiesService.createCompany(createCompanyDto, user);
  }

  @Get()
  @ResponseMessage('Fetch list company paginate succesfully') // custom decorators
  findAll(
    @Query('page') currentPage: string,
    @Query('limit') limit: string,
    @Query() queryString: string,
  ) {
    return this.companiesService.findAll(+currentPage, +limit, queryString);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @User() user: IUser,
  ) {
    return this.companiesService.updateCompany(id, updateCompanyDto, user);
  }

  @Delete(':id')
  remove(
    @Param('id')
    id: string,
    @User() user: IUser,
  ) {
    return this.companiesService.removeCompany(id, user);
  }
}
