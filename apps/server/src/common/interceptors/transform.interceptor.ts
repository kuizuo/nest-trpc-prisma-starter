import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ResOp } from '@server/common/model/response.model'
import { isObjectLike, omit } from 'lodash'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import snakecaseKeys from 'snakecase-keys'

import { BYPASS_KEY } from '../decorators/bypass.decorator'
import { OMIT_RESPONSE_PROTECT_KEY } from '../decorators/protect-keys.decorator'

/**
 * 统一处理返回接口结果
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    if (!context.switchToHttp().getRequest())
      return next.handle()

    const handler = context.getHandler()

    const bypass = this.reflector.get<boolean>(
      BYPASS_KEY,
      handler,
    )

    if (bypass)
      return next.handle()

    const omitKeys = this.reflector.getAllAndOverride(
      OMIT_RESPONSE_PROTECT_KEY,
      [handler, context.getClass()],
    )

    return next.handle().pipe(
      map((data) => {
        // if (typeof data === 'undefined') {
        //   context.switchToHttp().getResponse().status(HttpStatus.NO_CONTENT);
        //   return data;
        // }

        if (Array.isArray(omitKeys))
          data = omit(data, omitKeys)

        // data = this.serialize(data)

        return new ResOp({
          data,
        })
      }),
    )
  }

  private serialize(obj: any) {
    if (!isObjectLike(obj))
      return obj

    return snakecaseKeys(obj, { deep: true })
  }
}
