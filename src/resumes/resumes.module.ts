import { Module } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { Resume, ResumeModel } from './schemas/resume.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Resume.name, schema: ResumeModel }]),
  ],
  controllers: [ResumesController],
  providers: [ResumesService],
})
export class ResumesModule {} 
