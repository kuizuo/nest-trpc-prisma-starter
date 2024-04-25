import { type ConfigType, registerAs } from '@nestjs/config'

import { env } from '@server/global/env'

export const GoogleConfig = registerAs('google', () => ({
  clientId: env('GOOGLE_CLIENT_ID'),
  secret: env('GOOGLE_SECRET'),
}))

export type IGoogleConfig = ConfigType<typeof GoogleConfig>
