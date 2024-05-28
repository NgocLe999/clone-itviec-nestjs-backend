import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './passport/jwt.strategy';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersSchema } from 'src/users/schemas/user.schema';
import ms from 'ms';
import { RolesService } from 'src/roles/roles.service';

import { Role, RoleModel } from 'src/roles/schemas/role.schema';
import { RolesModule } from 'src/roles/roles.module';
@Module({
  imports: [
    RolesModule,
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn:
            ms(configService.get<string>('JWT_ACCESS_TOKEN_EXPIRE')) / 1000,
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Users.name, schema: UsersSchema }]),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleModel }]),

  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, RolesService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
