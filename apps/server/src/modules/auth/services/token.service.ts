import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { RedisKeys } from '@server/constants/cache.constant'

import { ErrorCode, ErrorCodeEnum } from '@server/constants/error-code.constant'

import { getRedisKey } from '@server/utils/redis.util'
import { Redis } from 'ioredis'

@Injectable()
export class TokenService {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,

    private readonly jwtService: JwtService,
  ) {}

  async generateToken(payload: IAuthUser, otherInfo?: any) {
    const token = this.jwtService.sign(payload)

    // store in redis
    await this.redis.hset(
      getRedisKey(RedisKeys.JWTStore),
      payload.id,
      JSON.stringify({
        token,
        date: new Date().toISOString(),
        ...otherInfo,
      }),
    )

    return token
  }

  async isTokenInRedis(userId: string) {
    if (!userId)
      return false
    const key = getRedisKey(RedisKeys.JWTStore)
    const has = await this.redis.hexists(key, userId)
    return !!has
  }

  async removeToken(userId: string) {
    const key = getRedisKey(RedisKeys.JWTStore)

    await this.redis.hdel(
      key,
      userId,
    )
  }

  async revokeAll() {
    const key = getRedisKey(RedisKeys.JWTStore)
    await this.redis.del(key)
  }

  async verifyToken(token: string) {
    const jwt = token.replace(/[Bb]earer /, '')

    if (!isJWT(jwt))
      throw new UnauthorizedException(ErrorCode[ErrorCodeEnum.JWTInvalid])

    try {
      const result = this.jwtService.verify(jwt) as IAuthUser
      if (!result)
        return false

      const has = await this.isTokenInRedis(result.id)
      if (!has)
        return false

      return result
    }
    catch (error) {
      return false
    }
  }
}

function isJWT(token: string): boolean {
  const parts = token.split('.')
  return (
    parts.length === 3
    && /^[a-zA-Z0-9_-]+$/.test(parts[0])
    && /^[a-zA-Z0-9_-]+$/.test(parts[1])
    && /^[a-zA-Z0-9_-]+$/.test(parts[2])
  )
}
