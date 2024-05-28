import { Module } from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { DatabasesController } from './databases.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersSchema } from 'src/users/schemas/user.schema';
import {
  Permission,
  PermissionsModel,
} from 'src/permissions/schemas/permission.schema';
import { Role, RoleModel } from 'src/roles/schemas/role.schema';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Users.name, schema: UsersSchema },
      { name: Permission.name,schema: PermissionsModel},
      { name: Role.name, schema: RoleModel },
    ])
  ],
  controllers: [DatabasesController],
  providers: [DatabasesService,UsersService],
})
export class DatabasesModule {}
