import { type ConfigType, registerAs } from '@nestjs/config'

import { env, envNumber } from '@server/global/env'

export const RedisConfig = registerAs('redis', () => ({
  host: env('REDIS_HOST', '127.0.0.1'),
  port: envNumber('REDIS_PORT', 6379),
  password: env('REDIS_PASSWORD'),
  db: envNumber('REDIS_DB'),
  ttl: null,
  httpCacheTTL: 15,
  max: 120,
}))

export type IRedisConfig = ConfigType<typeof RedisConfig>
