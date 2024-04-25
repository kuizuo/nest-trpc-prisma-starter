import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { Throttle, ThrottlerGuard } from '@nestjs/throttler'

import { RedisKeys } from '@server/constants/cache.constant'
import { getRedisKey } from '@server/utils/redis.util'
import { generateUUID } from '@server/utils/tool.util'
import Redis from 'ioredis'
import { isEmpty } from 'lodash'
import * as svgCaptcha from 'svg-captcha'

import { ImageCaptcha } from '../auth.model'
import { Public } from '../decorators/public.decorator'

import { ImageCaptchaDto } from './captcha.dto'

@ApiTags('Captcha - 验证码模块')
@UseGuards(ThrottlerGuard)
@Controller('auth/captcha')
export class CaptchaController {
  constructor(@InjectRedis() private redis: Redis) {}

  @Get('image')
  @Public()
  @Throttle({ default: { limit: 2, ttl: 600000 } })
  async captchaByImg(@Query() dto: ImageCaptchaDto): Promise<ImageCaptcha> {
    const { width, height } = dto

    const svg = svgCaptcha.create({
      size: 4,
      color: true,
      noise: 4,
      width: isEmpty(width) ? 100 : width,
      height: isEmpty(height) ? 50 : height,
      charPreset: '1234567890',
    })
    const data = {
      image: `data:image/svg+xml;base64,${Buffer.from(svg.data).toString(
        'base64',
      )}`,
      id: generateUUID(),
    }
    // 5分钟过期时间
    await this.redis.set(getRedisKey(RedisKeys.CaptchaStore, data.id), svg.text, 'EX', 5 * 60)
    return data
  }
}
