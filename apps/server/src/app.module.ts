import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'

import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE, HttpAdapterHost } from '@nestjs/core'

import * as config from '@server/config'

import { AllExceptionsFilter } from './common/filters/any-exception.filter'
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter'
import { IdempotenceInterceptor } from './common/interceptors/idempotence.interceptor'
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { ZodValidationPipe } from './common/pipes/zod-validation.pipe'
import { AuthModule } from './modules/auth/auth.module'
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard'
import { CaslModule } from './modules/casl/casl.module'
import { FileModule } from './modules/file/file.module'
import { UserModule } from './modules/user/user.module'
import { CacheModule } from './shared/cache/cache.module'
import { DatabaseModule } from './shared/database/database.module'
import { HelperModule } from './shared/helper/helper.module'
import { LoggerModule } from './shared/logger/logger.module'
import { RedisModule } from './shared/redis/redis.module'
import { TRPCModule } from './shared/trpc/trpc.module'
import { SocketModule } from './socket/socket.module'
import { TodoModule } from './modules/todo/todo.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
      load: [...Object.values(config)],
    }),
    LoggerModule,
    CacheModule,
    DatabaseModule,
    RedisModule,
    BullModule,
    HelperModule,

    AuthModule,
    UserModule,
    SocketModule,
    FileModule,

    // biz

    // end biz

    TodoModule,

    // wait module load
    CaslModule,
    TRPCModule,
  ],
  providers: [

    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useFactory: () => new TimeoutInterceptor(15 * 1000) },
    { provide: APP_INTERCEPTOR, useClass: IdempotenceInterceptor },

    { provide: APP_PIPE, useClass: ZodValidationPipe },

    {
      provide: APP_FILTER,
      useFactory: ({ httpAdapter }: HttpAdapterHost) => {
        return new PrismaClientExceptionFilter(httpAdapter)
      },
      inject: [HttpAdapterHost],
    },

    { provide: APP_FILTER, useClass: AllExceptionsFilter },

    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule { }
