import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Throttle, ThrottlerGuard } from '@nestjs/throttler'

import { Ip } from '@server/common/decorators/http.decorator'
import { MailerService } from '@server/shared/helper/mailer/mailer.service'

import { SendEmailCodeDto } from '../captcha/captcha.dto'
import { Public } from '../decorators/public.decorator'

@ApiTags('Auth - 认证模块')
@UseGuards(ThrottlerGuard)
@Controller('auth/email')
export class EmailController {
  constructor(
    private mailerService: MailerService,
  ) {}

  @Post('send')
  @Public()
  @Throttle({ default: { limit: 2, ttl: 60_000 } })
  async sendEmailCode(
    @Body() dto: SendEmailCodeDto,
    @Ip() ip: string,
  ): Promise<void> {
    const { email } = dto

    await this.mailerService.checkLimit(email, ip)
    const { code } = await this.mailerService.sendVerificationCode(email)

    await this.mailerService.log(email, code, ip)
  }
}
