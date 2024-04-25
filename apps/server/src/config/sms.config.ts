import { type ConfigType, registerAs } from '@nestjs/config'

import { env } from '@server/global/env'

export const SmsConfig = registerAs('sms', () => ({
  sign: env('SMS_SING', 'xxx'),
  region: env('SMS_REGION', 'ap-guangzhou'),
  appid: env('SMS_APPID', 'xxx'),
  secretId: env('SMS_SECRET_ID', 'your-secret-id'),
  secretKey: env('SMS_SECRET_KEY', 'your-secret-key'),
}))

export type ISmsConfig = ConfigType<typeof SmsConfig>
