import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/decorators/customize';
import { IUser } from 'src/users/users.interface';
import { Context } from 'vm';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  // input từ jwt.strategy // không @Public() sẽ vào hàm handleRequest
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw (
        // check JWT có hay không?
        err ||
        new UnauthorizedException(
          'Token không hợp lệ or không có token ở Bearer Token ở Header',
        )
      );
    }
    const currentMethod = request?.method;
    const currentPath = request?.route?.path as string;
    const permissions = user?.permissions ?? [];
    let isExist = permissions.find(
      (permission) =>
        currentMethod === permission.method &&
        currentPath === permission.apiPath,
    );

    // không phân quyền route này trong permissions user -- > public để chạy tiếp
    if (currentPath.startsWith('/api/v1/auth/')) isExist = true;

    if (!isExist) {
      throw new ForbiddenException(
        'Bạn không có quyền để truy cập endpoint này',
      ); /// Mã lỗi 403
    }

    return user;
  }
}
