import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export interface IApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null; // Allow null data for responses without content
}

export interface IServiceResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  IApiResponse<T> | void
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse<T> | void> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((res: IServiceResponse<T>) => {
        const statusCode = response.statusCode as number;

        // 204 No Content — return nothing
        if (statusCode === 204) {
          return;
        }

        // Wrap all other responses
        return {
          success: res?.success ?? (statusCode >= 200 && statusCode < 300),
          message: res?.message ?? null,
          data: res.data ?? null,
        };
      }),
    );
  }
}
