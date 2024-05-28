import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Company } from 'src/companies/schemas/company.schema';
import { Jobs } from 'src/jobs/schemas/job.schema';
export type ResumeDocument = HydratedDocument<Resume>;
// Schema shape data

class History {}
@Schema({ timestamps: true })
export class Resume {
  @Prop()
  email: string;

  @Prop()
  userId: mongoose.Schema.Types.ObjectId;

  @Prop()
  url: string;

  @Prop()
  status: string; // PENDING-REVIEWING-APPROVED-REJECTED

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Company.name })
  companyId: mongoose.Schema.Types.ObjectId; /// không check type nên để kiểu này cũng được// có thể ép về kiểu Company/

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Jobs.name })
  jobId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.Array })
  history: [
    {
      status: string;
      updatedAt: Date;
      updatedBy: { _id: mongoose.Schema.Types.ObjectId; email: string };
    },
  ];

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop()
  deletedAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  isDeleted: boolean;
}

export const ResumeModel = SchemaFactory.createForClass(Resume);
