import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsersDocument = HydratedDocument<Users>;
// Schema shape data
@Schema()
export class Users {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  phone: string;

  @Prop()
  name: string;

  @Prop()
  address: string;

  @Prop()
  age: number;
  @Prop()
  city: string;

  @Prop()
  createAt: string;

  @Prop()
  updateAt: string;
}

export const UsersSchema = SchemaFactory.createForClass(Users);
