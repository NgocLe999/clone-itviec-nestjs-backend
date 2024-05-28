import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE } from 'src/decorators/customize';

export interface Response<T> {
  statusCode: number;
  //   message: string;
  data: any;
}

@Injectable()
export class TransformationInterceptor<T> implements NestInterceptor<T, 
Response<T>> {
constructor(private reflector: Reflector) {}
intercept(context: ExecutionContext, next: CallHandler): 
Observable<Response<T>> {
   return next.handle().pipe(
   map((data) => ({
    message: this.reflector.get<string>(RESPONSE_MESSAGE,context.getHandler()) || data?.message || '',
    statusCode: context.switchToHttp().getResponse().statusCode,
    data: data,
//meta: {}, // if this is supposed to be the actual return then replace {} with data.result
      })),
    );
  }
}
