import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AppStore } from '../store/app.store';

@Injectable()
export class PersistStateInterceptor implements NestInterceptor {
  constructor(private readonly store: AppStore) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ method?: string }>();
    const method = request?.method ?? 'GET';
    const shouldPersist = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);

    if (!shouldPersist) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => {
          void this.store.persistSnapshot();
        },
      }),
    );
  }
}
