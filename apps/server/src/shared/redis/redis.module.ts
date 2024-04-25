import { RedisModule as NestRedisModule } from '@liaoliaots/nestjs-redis'
import { Global, Module, Provider } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { IRedisConfig } from '@server/config'
import { RedisOptions } from 'ioredis'

import { RedisSubPub } from './redis-subpub'
import { REDIS_PUBSUB } from './redis.constant'
import { RedisPubSubService } from './subpub.service'

const providers: Provider[] = [
  {
    provide: REDIS_PUBSUB,
    useFactory: (configService: ConfigService) => {
      const redisOptions: RedisOptions = configService.get<IRedisConfig>('redis')!
      return new RedisSubPub(redisOptions)
    },
    inject: [ConfigService],
  },
  RedisPubSubService,
]

@Global()
@Module({
  imports: [
    NestRedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        readyLog: true,
        config: configService.get<IRedisConfig>('redis'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers,
  exports: [...providers],
})
export class RedisModule {}
