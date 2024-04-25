import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Inject, Injectable, Logger } from '@nestjs/common'

import { MailerService as NestMailerService } from '@nestjs-modules/mailer'

import { BizException } from '@server/common/exceptions/biz.exception'
import { AppConfig, IAppConfig } from '@server/config'
import { ErrorCodeEnum } from '@server/constants/error-code.constant'
import { randomValue } from '@server/utils/tool.util'
import dayjs from 'dayjs'
import Redis from 'ioredis'

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name)
  constructor(
    @Inject(AppConfig.KEY) private appConfig: IAppConfig,
    @InjectRedis() private redis: Redis,
    private mailerService: NestMailerService,
  ) {}

  async log(to: string, code: string, ip: string) {
    const getRemainTime = () => {
      const now = dayjs()
      return now.endOf('day').diff(now, 'second')
    }

    await this.redis.set(`captcha:${to}`, code, 'EX', 60 * 5)

    const limitCountOfDay = await this.redis.get(`captcha:${to}:limit-day`) || 0

    await this.redis.set(`ip:${ip}:send:limit`, 1, 'EX', 60)
    await this.redis.set(`captcha:${to}:limit`, 1, 'EX', 60)
    await this.redis.set(
      `captcha:${to}:send:limit-count-day`,
      limitCountOfDay,
      'EX',
      getRemainTime(),
    )
  }

  async checkCode(to, code) {
    const ret = await this.redis.get(`captcha:${to}`)
    if (ret !== code)
      throw new BizException(ErrorCodeEnum.VerificationCodeError)

    await this.redis.del(`captcha:${to}`)
  }

  async checkLimit(to, ip) {
    const LIMIT_TIME = 5

    // 1分钟最多接收1条
    const limit = await this.redis.get(`captcha:${to}:limit`)
    if (limit)
      throw new BizException(ErrorCodeEnum.RequestTooFast)

    // 1天一个邮箱最多接收5条
    const limitCountOfDay: string | number = Number(await this.redis.get(`captcha:${to}:limit-day`)) || 0
    if (limitCountOfDay > LIMIT_TIME) {
      throw new BizException(
        ErrorCodeEnum.MaximumFiveVerificationCodesPerDay,
      )
    }
  }

  async send(
    to,
    subject,
    content: string,
    type: 'text' | 'html' = 'text',
  ): Promise<any> {
    if (type === 'text') {
      return this.mailerService.sendMail({
        to,
        subject,
        text: content,
      })
    }
    else {
      return this.mailerService.sendMail({
        to,
        subject,
        html: content,
      })
    }
  }

  async sendVerificationCode(to, code = randomValue(4, '1234567890')) {
    const subject = `[${this.appConfig.name}] 验证码`

    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template: './verification-code-zh',
        context: {
          code,
        },
      })
    }
    catch (error) {
      this.logger.error(error)
      throw new BizException(ErrorCodeEnum.VerificationCodeSendFail)
    }

    return {
      to,
      code,
    }
  }

  // async sendUserConfirmation(user: User, token: string) {
  //   const url = `example.com/auth/confirm?token=${token}`
  //   await this.mailerService.sendMail({
  //     to: user.email,
  //     subject: 'Confirm your Email',
  //     template: './confirmation',
  //     context: {
  //       name: user.name,
  //       url,
  //     },
  //   })
  // }
}
