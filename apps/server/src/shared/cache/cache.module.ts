import { CacheModule as NestCacheModule } from '@nestjs/cache-manager'
import { Global, Module } from '@nestjs/common'

import { ConfigModule, ConfigService } from '@nestjs/config'

import { IRedisConfig } from '@server/config'
import { redisStore } from 'cache-manager-ioredis-yet'
import { RedisOptions } from 'ioredis'

import { CacheService } from './cache.service'

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisOptions: RedisOptions = configService.get<IRedisConfig>('redis')!

        return {
          isGlobal: true,
          store: redisStore,
          isCacheableValue: () => true,
          ...redisOptions,
        }
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
