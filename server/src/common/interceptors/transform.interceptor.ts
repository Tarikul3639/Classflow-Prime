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
  status?: string; // Optional status field for additional context
  data: T | null; // Allow null data for responses without content
}

export interface IServiceResponse<T> {
  success?: boolean;
  message?: string;
  status: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, IApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse<T>> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((res: IServiceResponse<T>) => {
        const statusCode = response.statusCode;

        // Always return consistent response (no void)
        if (statusCode === 204) {
          return {
            success: true,
            message: null,
            status: 'no_content',
            data: null,
          };
        }

        return {
          success: res?.success ?? statusCode < 400,
          message: res?.message ?? null,
          status: res?.status ?? null,
          data: res?.data ?? null,
        };
      }),
    );
  }
}
