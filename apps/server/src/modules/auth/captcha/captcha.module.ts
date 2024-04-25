import { Module, Provider } from '@nestjs/common'

import { CaptchaController } from './captcha.controller'
import { CaptchaService } from './captcha.service'

const providers: Provider[] = [CaptchaService]

@Module({
  controllers: [CaptchaController],
  providers: [...providers],
  exports: [...providers],
})
export class CaptchaModule {}
