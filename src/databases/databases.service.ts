import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import {
  Permission,
  PermissionsDocument,
} from 'src/permissions/schemas/permission.schema';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { Users, UsersDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { ADMIN_ROLE, INIT_PERMISSIONS, USER_ROLE } from './sample';

@Injectable()
export class DatabasesService implements OnModuleInit {
  private readonly logger = new Logger(DatabasesService.name);

  constructor(
    @InjectModel(Users.name)
    private UsersModel: SoftDeleteModel<UsersDocument>,

    @InjectModel(Permission.name)
    private PermissionsModel: SoftDeleteModel<PermissionsDocument>,

    @InjectModel(Role.name)
    private RoleModel: SoftDeleteModel<RoleDocument>,

    private configService: ConfigService, // get file .env
    private usersService: UsersService, // hash password
  ) {}

  async onModuleInit() {
    const isInit = this.configService.get<string>('SHOULD_INIT');
    if (Boolean(isInit)) {
      const countUser = await this.UsersModel.count({});
      const countPermission = await this.PermissionsModel.count({});
      const countRole = await this.RoleModel.count({});

      //create permissions
      if (countPermission === 0) {
        await this.PermissionsModel.insertMany(INIT_PERMISSIONS);
        //bulk create
      }
      // create role
      if (countRole === 0) {
        const permissions = await this.PermissionsModel.find({}).select('_id');
        await this.RoleModel.insertMany([
          {
            name: ADMIN_ROLE,
            description: 'Admin thì full quyền :v',
            isActive: true,
            permissions: permissions,
          },
          {
            name: USER_ROLE,
            description: 'Người dùng/Ứng viên sử dụng hệ thống',
            isActive: true,
            permissions: [], //không set quyền, chỉ cần add ROLE
          },
        ]);
      }

      if (countUser === 0) {
        const adminRole = await this.RoleModel.findOne({ name: ADMIN_ROLE });
        const userRole = await this.RoleModel.findOne({ name: USER_ROLE });
        await this.UsersModel.insertMany([
          {
            name: "I'm admin",
            email: 'admin@gmail.com',
            password: this.usersService.hassPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            age: 69,
            gender: 'MALE',
            address: 'VietNam',
            role: adminRole?._id,
          },
          {
            name: "I'm Hỏi Dân IT",
            email: 'hoidanit@gmail.com',
            password: this.usersService.hassPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            age: 96,
            gender: 'MALE',
            address: 'VietNam',
            role: adminRole?._id,
          },
          {
            name: "I'm normal user",
            email: 'user@gmail.com',
            password: this.usersService.hassPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            age: 69,
            gender: 'MALE',
            address: 'VietNam',
            role: userRole?._id,
          },
        ]);
      }

      if (countUser > 0 && countRole > 0 && countPermission > 0) {
        // khong tao data fake
        this.logger.log('>>> ALREADY INIT SAMPLE DATA...');
      }
    }
  }
}
