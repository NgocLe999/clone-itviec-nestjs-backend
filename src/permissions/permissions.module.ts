import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionsModel } from './schemas/permission.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Permission.name, schema: PermissionsModel }]),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService]
})
export class PermissionsModule {}
