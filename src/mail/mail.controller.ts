import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorators/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectModel } from '@nestjs/mongoose';
import {
  Subscriber,
  SubscriberDocument,
} from 'src/subscribers/schemas/subscriber.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Jobs, JobsDocument } from 'src/jobs/schemas/job.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private mailerService: MailerService,
    @InjectModel(Subscriber.name)
    private SubscriberModel: SoftDeleteModel<SubscriberDocument>,
    @InjectModel(Jobs.name) private JobsModel: SoftDeleteModel<JobsDocument>,
  ) {}

  @Get()
  @Public()
  @ResponseMessage('Gửi email thành công!')
  @Cron(CronExpression. EVERY_DAY_AT_NOON)
  async handleTestEmail() {
    const subscribers = await this.SubscriberModel.find({});
    for (const subs of subscribers) {
      const subsSkills = subs.skills;
      const jobWithMatchingSkills = await this.JobsModel.find({
        skills: { $in: subsSkills },
      });

      if (jobWithMatchingSkills.length > 0) {
        const jobs = jobWithMatchingSkills.map((job) => {
          return {
            name: job.name,
            company: job.company,
            salary:
              `${job.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ',
            skills: job.skills,
          };
        });

        await this.mailerService.sendMail({
          to: 'lexuanngoc2207@gmail.com',
          from: '"Support Team" <support@example.com>', // override default from
          subject: 'Welcome to Nice App! Confirm your Email',
          template: 'new-job', // HTML body content
          context: {
            receiver: 'Lê Xuân Ngọc',
            jobs: jobs,
          },
        });
      }

      //todo

      //build template
    }
  }
}
